import joblib
import os
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "risk_model.pkl")

# Load model once at startup
_model = None
if os.path.exists(MODEL_PATH):
    try:
        _model = joblib.load(MODEL_PATH)
    except Exception as e:
        print(f"Error loading model: {e}")

def calculate_risk_score(features):
    """
    Features: [rainfall_mm, elevation_m, humidity_pct, wind_speed_kmh, historical_risk_bool]
    Returns a score 0-10.
    """
    if _model:
        try:
            # features is a list, model expects 2D array
            score = _model.predict([features])[0]
            return float(score)
        except Exception:
            pass
            
    # Fallback to heuristic
    rainfall, elevation, humidity, wind, hist_risk = features
    
    score = (rainfall / 50.0) * 5.0
    if elevation < 10:
        score += 3.0
    
    score += (humidity / 100.0) * 1.0
    score += (wind / 100.0) * 1.0
    
    if hist_risk:
        score += 2.0
        
    return min(max(score, 0.0), 10.0)

def apply_profile_modifier(base_score, kids_present, elderly_present):
    modifier = 1.0
    if kids_present or elderly_present:
        modifier = 1.5
    
    return min(base_score * modifier, 10.0)
