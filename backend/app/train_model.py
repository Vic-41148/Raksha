"""
Raksha ML Model Training
========================
Trains a RandomForestRegressor on EM-DAT-inspired realistic disaster data.

Data distributions modeled after real-world patterns:
- Rainfall: Exponential with monsoon spikes (South/SE Asia patterns)
- Elevation: Bimodal — coastal lowlands vs inland plateaus
- Humidity: Tropical distribution (60-100% during monsoon)
- Wind: Weibull distribution matching cyclone/storm patterns
- Historical risk: Based on proximity to known flood-prone zones

Reference: EM-DAT (Emergency Events Database) distributions for
flood/storm events in South Asia, SE Asia, West Africa, Latin America.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os


# ── Real-world city profiles (EM-DAT inspired) ──────────────────────────
# Each profile represents a category of real flood/storm-prone regions
CITY_PROFILES = {
    "coastal_lowland": {
        # Mumbai, Manila, Dhaka, Jakarta, Lagos, Ho Chi Minh City
        "elevation_range": (1, 15),
        "rainfall_scale": 25,       # Heavy monsoon rainfall
        "humidity_range": (75, 98),
        "wind_base": 15,
        "historical_risk_prob": 0.7,
        "weight": 0.25,
    },
    "river_delta": {
        # Kolkata, Dhaka, Bangkok, Hanoi, Yangon
        "elevation_range": (2, 20),
        "rainfall_scale": 20,
        "humidity_range": (70, 95),
        "wind_base": 10,
        "historical_risk_prob": 0.6,
        "weight": 0.20,
    },
    "urban_inland": {
        # Delhi, Hyderabad, Nairobi, São Paulo, Mexico City
        "elevation_range": (200, 400),
        "rainfall_scale": 12,
        "humidity_range": (50, 85),
        "wind_base": 8,
        "historical_risk_prob": 0.3,
        "weight": 0.20,
    },
    "semi_arid": {
        # Jaipur, Chennai (non-monsoon), Karachi, Cairo
        "elevation_range": (50, 300),
        "rainfall_scale": 5,
        "humidity_range": (30, 65),
        "wind_base": 12,
        "historical_risk_prob": 0.15,
        "weight": 0.15,
    },
    "highland": {
        # Kathmandu, Addis Ababa, Bogotá, La Paz
        "elevation_range": (1200, 2800),
        "rainfall_scale": 8,
        "humidity_range": (40, 80),
        "wind_base": 10,
        "historical_risk_prob": 0.2,
        "weight": 0.10,
    },
    "cyclone_coast": {
        # Odisha, Andhra Pradesh, Bangladesh coast, Philippines
        "elevation_range": (1, 25),
        "rainfall_scale": 35,       # Extreme during cyclones
        "humidity_range": (80, 99),
        "wind_base": 30,            # High wind speeds
        "historical_risk_prob": 0.85,
        "weight": 0.10,
    },
}


def generate_realistic_data(n_samples=5000):
    """
    Generate training data with distributions inspired by EM-DAT
    historical disaster records and real-world weather patterns.
    """
    np.random.seed(42)

    all_data = []

    for profile_name, profile in CITY_PROFILES.items():
        n = int(n_samples * profile["weight"])

        # Elevation: uniform within the range for this profile
        elevation = np.random.uniform(
            profile["elevation_range"][0],
            profile["elevation_range"][1],
            size=n
        )

        # Rainfall: exponential distribution (most days light, some heavy)
        # Add monsoon spike: 30% of samples get 2x-4x rainfall
        rainfall = np.random.exponential(scale=profile["rainfall_scale"], size=n)
        monsoon_mask = np.random.random(n) < 0.3
        rainfall[monsoon_mask] *= np.random.uniform(2.0, 4.0, size=monsoon_mask.sum())
        rainfall = np.clip(rainfall, 0, 200)  # Cap at 200mm (extreme event)

        # Humidity: skewed toward high end in tropical profiles
        humidity = np.random.uniform(
            profile["humidity_range"][0],
            profile["humidity_range"][1],
            size=n
        )

        # Wind: Weibull distribution (realistic for storm patterns)
        wind = np.random.weibull(2.0, size=n) * profile["wind_base"]
        # Add storm events: 10% get extreme wind
        storm_mask = np.random.random(n) < 0.1
        wind[storm_mask] *= np.random.uniform(2.0, 5.0, size=storm_mask.sum())
        wind = np.clip(wind, 0, 150)  # Cap at 150 km/h

        # Historical risk: probability-based
        historical_risk = np.random.choice(
            [0, 1], size=n,
            p=[1 - profile["historical_risk_prob"], profile["historical_risk_prob"]]
        )

        # ── Risk score calculation (ground truth) ──
        # Multi-factor formula inspired by actual flood risk indices:
        # - UNDRR Global Assessment Report methodology
        # - Indian Flood Vulnerability Index
        # - WMO storm risk guidelines

        # Rainfall contribution (primary driver, nonlinear)
        rain_score = np.where(
            rainfall < 10, (rainfall / 10.0) * 1.5,
            np.where(
                rainfall < 50, 1.5 + ((rainfall - 10) / 40.0) * 2.5,
                4.0 + ((rainfall - 50) / 150.0) * 2.0
            )
        )

        # Elevation contribution (inverse — lower = more risk)
        elev_score = np.where(
            elevation < 10, 3.0,
            np.where(
                elevation < 50, 2.0,
                np.where(
                    elevation < 200, 1.0,
                    0.2
                )
            )
        )

        # Humidity contribution
        humid_score = (humidity / 100.0) * 1.0

        # Wind contribution (nonlinear — high wind = storm)
        wind_score = np.where(
            wind < 20, (wind / 20.0) * 0.5,
            np.where(
                wind < 60, 0.5 + ((wind - 20) / 40.0) * 1.5,
                2.0 + ((wind - 60) / 90.0) * 1.0
            )
        )

        # Historical risk contribution
        hist_score = historical_risk * 1.5

        # Combined score
        score = rain_score + elev_score + humid_score + wind_score + hist_score

        # Add realistic noise (measurement uncertainty)
        noise = np.random.normal(0, 0.3, size=n)
        score = score + noise

        # Clip to 0-10
        score = np.clip(score, 0, 10)

        profile_df = pd.DataFrame({
            'rainfall_mm': np.round(rainfall, 2),
            'elevation_m': np.round(elevation, 2),
            'humidity_pct': np.round(humidity, 2),
            'wind_speed_kmh': np.round(wind, 2),
            'historical_risk_bool': historical_risk.astype(int),
            'risk_score': np.round(score, 2),
            'profile': profile_name,
        })
        all_data.append(profile_df)

    df = pd.concat(all_data, ignore_index=True)
    # Shuffle
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    return df


def train():
    print("=" * 60)
    print("  Raksha ML Model Training")
    print("  EM-DAT-inspired realistic disaster data")
    print("=" * 60)

    print("\n[1/4] Generating realistic training data...")
    df = generate_realistic_data(n_samples=5000)

    # Show data distribution
    print(f"\n  Total samples: {len(df)}")
    print(f"  Score distribution:")
    print(f"    SAFE (0-4):    {(df['risk_score'] <= 4).sum()} samples")
    print(f"    CAUTION (4-7): {((df['risk_score'] > 4) & (df['risk_score'] <= 7)).sum()} samples")
    print(f"    DANGER (7-10): {(df['risk_score'] > 7).sum()} samples")
    print(f"\n  City profile breakdown:")
    for profile in df['profile'].unique():
        count = (df['profile'] == profile).sum()
        avg_score = df[df['profile'] == profile]['risk_score'].mean()
        print(f"    {profile:20s}: {count:4d} samples, avg score: {avg_score:.2f}")

    print("\n[2/4] Splitting train/test...")
    X = df[['rainfall_mm', 'elevation_m', 'humidity_pct', 'wind_speed_kmh', 'historical_risk_bool']]
    y = df['risk_score']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"  Train: {len(X_train)}, Test: {len(X_test)}")

    print("\n[3/4] Training RandomForestRegressor...")
    model = RandomForestRegressor(
        n_estimators=150,
        max_depth=12,
        min_samples_split=5,
        min_samples_leaf=3,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"\n  Model Performance:")
    print(f"    MAE:  {mae:.4f}")
    print(f"    R²:   {r2:.4f}")

    # Feature importance
    print(f"\n  Feature Importance:")
    for name, importance in sorted(
        zip(X.columns, model.feature_importances_),
        key=lambda x: x[1], reverse=True
    ):
        bar = "#" * int(importance * 40)
        print(f"    {name:25s}: {importance:.3f} {bar}")

    print("\n[4/4] Saving model...")
    model_dir = os.path.join(os.path.dirname(__file__), "models")
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)

    model_path = os.path.join(model_dir, "risk_model.pkl")
    joblib.dump(model, model_path)
    print(f"  Saved to: {model_path}")

    # Save training data for reference
    data_path = os.path.join(model_dir, "training_data_sample.csv")
    df.head(100).to_csv(data_path, index=False)
    print(f"  Sample data saved to: {data_path}")

    print("\n" + "=" * 60)
    print("  Training complete!")
    print("=" * 60)


if __name__ == "__main__":
    train()
