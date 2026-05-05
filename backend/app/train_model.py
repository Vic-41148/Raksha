import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

def generate_synthetic_data(n_samples=5000):
    np.random.seed(42)
    
    rainfall = np.random.exponential(scale=10, size=n_samples) # Most days have little rain
    elevation = np.random.uniform(0, 500, size=n_samples)
    humidity = np.random.uniform(30, 100, size=n_samples)
    wind = np.random.uniform(0, 100, size=n_samples)
    historical_risk = np.random.choice([0, 1], size=n_samples, p=[0.8, 0.2])
    
    # Logic for risk score
    # High rain + low elevation = high flood risk
    # High wind + high rain = storm risk
    # High temp (not in features yet but humidity/rain proxy)
    
    score = (rainfall / 50.0) * 4.0
    score += (1.0 - (elevation / 500.0)) * 2.0
    score += (humidity / 100.0) * 1.5
    score += (wind / 100.0) * 1.5
    score += historical_risk * 2.0
    
    # Add noise
    score += np.random.normal(0, 0.5, size=n_samples)
    
    score = np.clip(score, 0, 10)
    
    df = pd.DataFrame({
        'rainfall_mm': rainfall,
        'elevation_m': elevation,
        'humidity_pct': humidity,
        'wind_speed_kmh': wind,
        'historical_risk_bool': historical_risk,
        'risk_score': score
    })
    
    return df

def train():
    print("Generating data...")
    df = generate_synthetic_data()
    
    X = df.drop('risk_score', axis=1)
    y = df['risk_score']
    
    print("Training model...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    model_dir = 'backend/app/models'
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
        
    model_path = os.path.join(model_dir, 'risk_model.pkl')
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train()
