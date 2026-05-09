import joblib
import os
import numpy as np
from .config import MODEL_PATH

# Load model once at startup
_model = None
if os.path.exists(MODEL_PATH):
    try:
        _model = joblib.load(MODEL_PATH)
        print(f"[Raksha ML] Model loaded from {MODEL_PATH}")
    except Exception as e:
        print(f"[Raksha ML] Error loading model: {e}")
else:
    print(f"[Raksha ML] No model found at {MODEL_PATH}, using heuristic fallback")

def calculate_risk_score(features):
    """
    Features: [rainfall_mm, elevation_m, humidity_pct, wind_speed_kmh, historical_risk_bool]
    Returns a score 0-10.
    """
    if _model:
        try:
            # features is a list, model expects 2D array
            score = _model.predict([features])[0]
            return float(np.clip(score, 0.0, 10.0))
        except Exception as e:
            print(f"[Raksha ML] Prediction error: {e}, falling back to heuristic")

    # Heuristic fallback (aligned with training data logic)
    rainfall, elevation, humidity, wind, hist_risk = features

    # Rainfall (primary driver, nonlinear)
    if rainfall < 10:
        score = (rainfall / 10.0) * 1.5
    elif rainfall < 50:
        score = 1.5 + ((rainfall - 10) / 40.0) * 2.5
    else:
        score = 4.0 + ((rainfall - 50) / 150.0) * 2.0

    # Elevation (inverse)
    if elevation < 10:
        score += 3.0
    elif elevation < 50:
        score += 2.0
    elif elevation < 200:
        score += 1.0
    else:
        score += 0.2

    # Humidity
    score += (humidity / 100.0) * 1.0

    # Wind (nonlinear)
    if wind < 20:
        score += (wind / 20.0) * 0.5
    elif wind < 60:
        score += 0.5 + ((wind - 20) / 40.0) * 1.5
    else:
        score += 2.0 + ((wind - 60) / 90.0) * 1.0

    # Historical risk
    if hist_risk:
        score += 1.5

    return float(min(max(score, 0.0), 10.0))

def apply_profile_modifier(base_score, kids_present, elderly_present):
    """
    Apply family profile modifier.
    Kids or elderly = more conservative (higher risk threshold).
    """
    modifier = 1.0
    if kids_present and elderly_present:
        modifier = 1.6
    elif kids_present or elderly_present:
        modifier = 1.4

    return float(min(base_score * modifier, 10.0))
