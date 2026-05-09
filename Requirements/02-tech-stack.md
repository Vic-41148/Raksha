# Raksha — Tech Stack

## Final Stack (No Changes)
Frontend   →  React + Vite + Tailwind (mobile-first, 390px)
Backend    →  FastAPI
Weather    →  OpenWeatherMap API (free tier)
Elevation  →  Open-Elevation API (free, global)
ML         →  sklearn RandomForestClassifier
AI         →  Groq llama-3.3-70b
DB         →  SQLite via SQLAlchemy
Deploy     →  local server + Tailscale Funnel (primary)
Backup     →  Render free tier (sklearn .pkl is ~3MB, fits fine)
Demo from  →  Samsung M52

## Cut Entirely

Add back **only** if Day 8 has spare time:

- Docker Compose
- PostgreSQL
- Twilio SMS
- PWA / offline mode

## The Pipeline
OpenWeatherMap → rainfall, humidity, wind, temp
+
Open-Elevation API → terrain multiplier (per coords)
↓
sklearn RandomForest → risk score 0–10 (flood / heat / storm)
↓
Profile modifier → kids/elderly present = threshold –1.5x
↓
Groq llama-3.3-70b → ONE actionable sentence
↓
Single card: GREEN / YELLOW / RED

## ML Model

```python
features = [
    rainfall_mm,          # OpenWeatherMap
    elevation_m,          # Open-Elevation API
    humidity_pct,
    wind_speed_kmh,
    historical_risk_bool  # EM-DAT public dataset lookup
]
# Output: risk score 0–10
# Profile modifier applied post-score
```

**Dataset:** EM-DAT historical disaster data. 500 real rows > 5000 synthetic rows when a judge asks.

Train locally → `joblib.dump(model, "model/risk_model.pkl")` → commit pkl → load at startup.

## Fallbacks

| Service | Failure | Fallback |
|---|---|---|
| OpenWeatherMap | Rate limit / outage | Hardcoded forecast JSON |
| Groq | Rate limit | Template: "Risk is HIGH. Stay home." |
| Open-Elevation | Flaky | Default 50m elevation (conservative) |
| SQLite | N/A | File-based, nothing to fail |

## Gut Check

| Question | Status |
|---|---|
| Hello world across full stack in 30 min? | ✅ Done this exact combo before |
| API keys ready? | ⚠️ Get OpenWeatherMap + Groq tonight |
| Mocked data fallback? | ✅ Hardcoded JSON ready |
| Demo on hotspot? | ✅ Tailscale Funnel from home server |