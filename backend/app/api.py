from fastapi import APIRouter, HTTPException
import requests
from .config import OPENWEATHERMAP_API_KEY, OPEN_ELEVATION_API_URL, GROQ_API_KEY
from .ml import calculate_risk_score, apply_profile_modifier
from pydantic import BaseModel

router = APIRouter()

class RiskRequest(BaseModel):
    lat: float
    lon: float
    kids_present: bool = False
    elderly_present: bool = False

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
    
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHERMAP_API_KEY}&units=metric"
    response = requests.get(url)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Error fetching weather data")
    
    data = response.json()
    return {
        "rainfall_mm": data.get("rain", {}).get("1h", 0.0),
        "humidity_pct": data.get("main", {}).get("humidity"),
        "wind_speed_kmh": data.get("wind", {}).get("speed", 0.0) * 3.6,
        "temp_c": data.get("main", {}).get("temp"),
        "condition": data.get("weather", [{}])[0].get("main")
    }

@router.get("/elevation")
async def get_elevation(lat: float, lon: float):
    try:
        response = requests.get(f"{OPEN_ELEVATION_API_URL}?locations={lat},{lon}")
        if response.status_code != 200:
            return {"elevation_m": 50.0}
        
        data = response.json()
        return {"elevation_m": data["results"][0]["elevation"]}
    except Exception:
        return {"elevation_m": 50.0}

from .database import SessionLocal, AlertLog

@router.post("/risk")
async def get_risk(request: RiskRequest):
    weather = await get_weather(request.lat, request.lon)
    elevation = await get_elevation(request.lat, request.lon)
    
    # In Day 2 we will add historical risk lookup
    historical_risk = False 
    
    features = [
        weather["rainfall_mm"],
        elevation["elevation_m"],
        weather["humidity_pct"],
        weather["wind_speed_kmh"],
        historical_risk
    ]
    
    base_score = calculate_risk_score(features)
    final_score = apply_profile_modifier(base_score, request.kids_present, request.elderly_present)
    
    risk_level = "SAFE"
    if final_score > 7.0:
        risk_level = "DANGER"
    elif final_score > 4.0:
        risk_level = "CAUTION"
        
    decision = get_decision_from_groq(risk_level, weather, final_score)
    
    # Log to DB
    db = SessionLocal()
    try:
        log = AlertLog(
            lat=request.lat,
            lon=request.lon,
            risk_level=risk_level,
            score=final_score,
            decision=decision,
            kids_present=request.kids_present,
            elderly_present=request.elderly_present
        )
        db.add(log)
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()
    
    return {
        "risk_level": risk_level,
        "score": final_score,
        "decision": decision,
        "weather": weather,
        "elevation_m": elevation["elevation_m"]
    }

@router.get("/history")
async def get_history():
    db = SessionLocal()
    try:
        logs = db.query(AlertLog).order_by(AlertLog.timestamp.desc()).limit(10).all()
        return logs
    finally:
        db.close()

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
    
    prompt = f"""
    You are Raksha, a safety assistant. Based on the following data, provide ONE actionable, clear, and urgent sentence for a family.
    
    Risk Level: {risk_level}
    Score: {score}/10
    Rainfall: {weather['rainfall_mm']}mm
    Wind: {weather['wind_speed_kmh']}km/h
    Condition: {weather['condition']}
    
    Rules:
    - Exactly ONE sentence.
    - Start with a clear action (e.g. STAY HOME, BE CAUTIOUS, ALL CLEAR).
    - Be hyperlocal and practical.
    - No fluff.
    """
    
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=50
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        # Fallback if API fails
        if risk_level == "DANGER":
            return "STAY HOME. High flood risk detected. Keep emergency contacts ready."
        elif risk_level == "CAUTION":
            return "BE PREPARED. Heavy rain expected. Avoid low-lying areas."
        else:
            return "LOOKS CLEAR. Weather is stable for your profile today."
