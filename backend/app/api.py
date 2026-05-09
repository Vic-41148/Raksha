from fastapi import APIRouter, HTTPException
import requests
from .config import OPENWEATHERMAP_API_KEY, OPEN_ELEVATION_API_URL, GROQ_API_KEY
from .ml import calculate_risk_score, apply_profile_modifier
from .historical_risk import get_historical_risk, get_nearby_zones
from .database import SessionLocal, AlertLog, SafeConfirmation
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


# ── Request/Response models ──────────────────────────────────────────

class RiskRequest(BaseModel):
    lat: float
    lon: float
    kids_present: bool = False
    elderly_present: bool = False
    city: str = ""
    country: str = ""


class SafeConfirmRequest(BaseModel):
    lat: float
    lon: float
    city: str = ""


class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]


# ── Emergency helpline database ──────────────────────────────────────

HELPLINES = {
    "india": {
        "country": "India",
        "emergency": "112",
        "disaster": "1078",
        "disaster_name": "NDRF (National Disaster Response Force)",
        "flood": "1070",
        "flood_name": "Flood Control Room",
        "ambulance": "108",
        "police": "100",
        "fire": "101",
    },
    "bangladesh": {
        "country": "Bangladesh",
        "emergency": "999",
        "disaster": "1090",
        "disaster_name": "Disaster Management",
        "ambulance": "199",
        "police": "999",
        "fire": "9555555",
    },
    "philippines": {
        "country": "Philippines",
        "emergency": "911",
        "disaster": "8911-1406",
        "disaster_name": "NDRRMC",
        "ambulance": "911",
        "police": "911",
        "fire": "911",
    },
    "indonesia": {
        "country": "Indonesia",
        "emergency": "112",
        "disaster": "129",
        "disaster_name": "BNPB (Disaster Agency)",
        "ambulance": "118",
        "police": "110",
        "fire": "113",
    },
    "thailand": {
        "country": "Thailand",
        "emergency": "191",
        "disaster": "1784",
        "disaster_name": "DDPM Disaster Prevention",
        "ambulance": "1669",
        "police": "191",
        "fire": "199",
    },
    "vietnam": {
        "country": "Vietnam",
        "emergency": "113",
        "disaster": "114",
        "disaster_name": "Emergency Services",
        "ambulance": "115",
        "police": "113",
        "fire": "114",
    },
    "nigeria": {
        "country": "Nigeria",
        "emergency": "112",
        "disaster": "0800-2255-7362",
        "disaster_name": "NEMA (Emergency Management)",
        "ambulance": "112",
        "police": "112",
        "fire": "112",
    },
    "nepal": {
        "country": "Nepal",
        "emergency": "100",
        "disaster": "1150",
        "disaster_name": "Disaster Management",
        "ambulance": "102",
        "police": "100",
        "fire": "101",
    },
    "pakistan": {
        "country": "Pakistan",
        "emergency": "1122",
        "disaster": "1129",
        "disaster_name": "NDMA (Disaster Authority)",
        "ambulance": "1122",
        "police": "15",
        "fire": "16",
    },
    "mexico": {
        "country": "Mexico",
        "emergency": "911",
        "disaster": "911",
        "disaster_name": "Protección Civil",
        "ambulance": "911",
        "police": "911",
        "fire": "911",
    },
    "brazil": {
        "country": "Brazil",
        "emergency": "190",
        "disaster": "199",
        "disaster_name": "Defesa Civil",
        "ambulance": "192",
        "police": "190",
        "fire": "193",
    },
    "default": {
        "country": "International",
        "emergency": "112",
        "disaster": "112",
        "disaster_name": "Emergency Services",
        "ambulance": "112",
        "police": "112",
        "fire": "112",
    },
}


# ── Weather endpoint ─────────────────────────────────────────────────

@router.get("/weather")
async def get_weather(lat: float, lon: float):
    if not OPENWEATHERMAP_API_KEY:
        return {
            "rainfall_mm": 5.0,
            "humidity_pct": 80,
            "wind_speed_kmh": 15.0,
            "temp_c": 28.0,
            "condition": "Rain"
        }

    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?lat={lat}&lon={lon}&appid={OPENWEATHERMAP_API_KEY}&units=metric"
    )
    response = requests.get(url, timeout=10)
    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail="Error fetching weather data"
        )

    data = response.json()
    return {
        "rainfall_mm": data.get("rain", {}).get("1h", 0.0),
        "humidity_pct": data.get("main", {}).get("humidity", 50),
        "wind_speed_kmh": round(data.get("wind", {}).get("speed", 0.0) * 3.6, 1),
        "temp_c": data.get("main", {}).get("temp", 25.0),
        "condition": data.get("weather", [{}])[0].get("main", "Clear"),
        "description": data.get("weather", [{}])[0].get("description", ""),
        "feels_like": data.get("main", {}).get("feels_like", 25.0),
        "pressure": data.get("main", {}).get("pressure", 1013),
    }


# ── Elevation endpoint ───────────────────────────────────────────────

@router.get("/elevation")
async def get_elevation(lat: float, lon: float):
    try:
        response = requests.get(
            f"{OPEN_ELEVATION_API_URL}?locations={lat},{lon}",
            timeout=10
        )
        if response.status_code != 200:
            return {"elevation_m": 50.0}

        data = response.json()
        return {"elevation_m": data["results"][0]["elevation"]}
    except Exception:
        return {"elevation_m": 50.0}


# ── Core risk assessment endpoint ────────────────────────────────────

@router.post("/risk")
async def get_risk(request: RiskRequest):
    weather = await get_weather(request.lat, request.lon)
    elevation = await get_elevation(request.lat, request.lon)

    # Real historical risk lookup
    is_historical_risk, hist_details = get_historical_risk(request.lat, request.lon)

    features = [
        weather["rainfall_mm"],
        elevation["elevation_m"],
        weather["humidity_pct"],
        weather["wind_speed_kmh"],
        is_historical_risk
    ]

    base_score = calculate_risk_score(features)
    final_score = apply_profile_modifier(
        base_score, request.kids_present, request.elderly_present
    )

    risk_level = "SAFE"
    if final_score > 7.0:
        risk_level = "DANGER"
    elif final_score > 4.0:
        risk_level = "CAUTION"

    decision = get_decision_from_groq(risk_level, weather, final_score)

    # Get nearby disaster zones for context
    nearby_zones = get_nearby_zones(request.lat, request.lon, max_distance_km=100)

    # Log to DB
    db = SessionLocal()
    try:
        log = AlertLog(
            lat=request.lat,
            lon=request.lon,
            country=request.country,
            risk_level=risk_level,
            score=final_score,
            decision=decision,
            kids_present=request.kids_present,
            elderly_present=request.elderly_present,
            historical_zone=hist_details.get("zone_name", hist_details.get("nearest_zone", "")),
        )
        db.add(log)
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()

    return {
        "risk_level": risk_level,
        "score": round(final_score, 1),
        "decision": decision,
        "weather": weather,
        "elevation_m": elevation["elevation_m"],
        "historical_risk": is_historical_risk,
        "historical_details": hist_details,
        "nearby_zones": nearby_zones[:3],  # Top 3 nearest zones
    }


# ── History endpoint ─────────────────────────────────────────────────

@router.get("/history")
async def get_history():
    db = SessionLocal()
    try:
        logs = db.query(AlertLog).order_by(AlertLog.timestamp.desc()).limit(10).all()
        return [
            {
                "id": log.id,
                "timestamp": log.timestamp.isoformat() if log.timestamp else None,
                "lat": log.lat,
                "lon": log.lon,
                "risk_level": log.risk_level,
                "score": log.score,
                "decision": log.decision,
            }
            for log in logs
        ]
    finally:
        db.close()


# ── Safe confirmation endpoint ───────────────────────────────────────

@router.post("/safe-confirm")
async def confirm_safe(request: SafeConfirmRequest):
    db = SessionLocal()
    try:
        confirmation = SafeConfirmation(
            lat=request.lat,
            lon=request.lon,
            city=request.city,
        )
        db.add(confirmation)
        db.commit()
        return {"status": "confirmed", "message": "Stay safe! Confirmation logged."}
    except Exception:
        db.rollback()
        return {"status": "confirmed", "message": "Stay safe!"}
    finally:
        db.close()


# ── Helplines endpoint ───────────────────────────────────────────────

@router.get("/helplines")
async def get_helplines(country: str = ""):
    country_key = country.lower().strip()

    # Try exact match first
    if country_key in HELPLINES:
        return HELPLINES[country_key]

    # Try partial match
    for key, data in HELPLINES.items():
        if key != "default" and (key in country_key or country_key in key):
            return data

    return HELPLINES["default"]


# ── Groq LLM decision generation ────────────────────────────────────

from groq import Groq

def get_decision_from_groq(risk_level, weather, score):
    if not GROQ_API_KEY:
        if risk_level == "DANGER":
            return "STAY HOME. High flood risk detected. Keep emergency contacts ready."
        elif risk_level == "CAUTION":
            return "BE PREPARED. Heavy rain expected. Avoid low-lying areas."
        else:
            return "LOOKS CLEAR. Weather is stable for your profile today."

    client = Groq(api_key=GROQ_API_KEY)

    prompt = f"""You are Raksha, a safety assistant. Based on the following data, provide ONE actionable, clear, and urgent sentence for a family.

Risk Level: {risk_level}
Score: {score}/10
Rainfall: {weather['rainfall_mm']}mm
Wind: {weather['wind_speed_kmh']}km/h
Temperature: {weather.get('temp_c', 'N/A')}°C
Humidity: {weather['humidity_pct']}%
Condition: {weather['condition']}

Rules:
- Exactly ONE sentence.
- Start with a clear action verb in caps (e.g. STAY HOME, BE CAUTIOUS, ALL CLEAR, AVOID TRAVEL).
- Be hyperlocal and practical — mention specific things to do.
- No fluff, no disclaimers.
- If DANGER: urgent, direct, life-safety focused.
- If CAUTION: preparedness-focused, mention specific precautions.
- If SAFE: reassuring but mention staying updated."""

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=60,
            temperature=0.3,
        )
        return completion.choices[0].message.content.strip()
    except Exception:
        # Fallback if API fails
        if risk_level == "DANGER":
            return "STAY HOME. High flood risk detected. Keep emergency contacts ready."
        elif risk_level == "CAUTION":
            return "BE PREPARED. Heavy rain expected. Avoid low-lying areas."
        else:
            return "LOOKS CLEAR. Weather is stable for your profile today."


@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured. Chat is unavailable.")

    client = Groq(api_key=GROQ_API_KEY)
    
    system_prompt = {
        "role": "system",
        "content": "You are Raksha, an AI safety and disaster-preparedness assistant. Keep responses extremely concise (1-3 sentences max), supportive, and focused on safety, emergency prep, or first aid. Do not use markdown like bolding or lists unless necessary."
    }
    
    messages = [system_prompt] + [{"role": m.role, "content": m.content} for m in request.messages]
    
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=200,
            temperature=0.5,
        )
        return {"response": completion.choices[0].message.content.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect to Groq: {str(e)}")
