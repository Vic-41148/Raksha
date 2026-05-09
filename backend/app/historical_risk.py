"""
Raksha Historical Risk Lookup
==============================
Real-world flood/storm-prone zone database.
Coordinates from EM-DAT, FloodList, ReliefWeb historical records.

Returns whether a given lat/lon is within proximity of a known
historically disaster-prone area.
"""

import math
from typing import Tuple

# ── Known flood/storm-prone zones worldwide ──────────────────────────
# Source: EM-DAT historical disaster records, FloodList archives
# Format: (lat, lon, radius_km, risk_type, location_name)
DISASTER_ZONES = [
    # ── South Asia ──
    (28.6139, 77.2090, 40, "flood", "Delhi NCR, India"),
    (19.0760, 72.8777, 35, "flood", "Mumbai, India"),
    (22.5726, 88.3639, 50, "flood", "Kolkata, India"),
    (13.0827, 80.2707, 40, "flood", "Chennai, India"),
    (17.3850, 78.4867, 35, "flood", "Hyderabad, India"),
    (26.9124, 75.7873, 30, "flood", "Jaipur, India"),
    (25.4358, 81.8463, 40, "flood", "Prayagraj, India"),
    (26.8467, 80.9462, 45, "flood", "Lucknow, India"),
    (21.1702, 72.8311, 30, "flood", "Surat, India"),
    (23.2599, 77.4126, 30, "flood", "Bhopal, India"),
    (20.2961, 85.8245, 60, "cyclone", "Bhubaneswar/Odisha, India"),
    (15.9129, 79.7400, 50, "cyclone", "Andhra Pradesh coast, India"),
    (23.8103, 90.4125, 60, "flood", "Dhaka, Bangladesh"),
    (22.3569, 91.7832, 50, "cyclone", "Chittagong, Bangladesh"),
    (27.7172, 85.3240, 40, "flood", "Kathmandu, Nepal"),
    (24.8607, 67.0011, 40, "flood", "Karachi, Pakistan"),
    (6.9271, 79.8612, 30, "flood", "Colombo, Sri Lanka"),

    # ── Southeast Asia ──
    (14.5995, 120.9842, 40, "flood", "Manila, Philippines"),
    (11.5564, 124.9460, 60, "cyclone", "Tacloban, Philippines"),
    (13.7563, 100.5018, 50, "flood", "Bangkok, Thailand"),
    (-6.2088, 106.8456, 45, "flood", "Jakarta, Indonesia"),
    (-7.7956, 110.3695, 30, "flood", "Yogyakarta, Indonesia"),
    (21.0285, 105.8542, 35, "flood", "Hanoi, Vietnam"),
    (10.8231, 106.6297, 40, "flood", "Ho Chi Minh City, Vietnam"),
    (16.4637, 107.5909, 40, "flood", "Hue, Vietnam"),
    (16.8661, 96.1951, 50, "flood", "Yangon, Myanmar"),
    (3.1390, 101.6869, 30, "flood", "Kuala Lumpur, Malaysia"),

    # ── East Asia ──
    (30.5728, 104.0668, 50, "flood", "Chengdu, China"),
    (23.1291, 113.2644, 40, "flood", "Guangzhou, China"),
    (30.2741, 120.1551, 35, "flood", "Hangzhou, China"),

    # ── West Africa ──
    (6.5244, 3.3792, 40, "flood", "Lagos, Nigeria"),
    (9.0579, 7.4951, 35, "flood", "Abuja, Nigeria"),
    (6.6018, -1.6575, 30, "flood", "Kumasi, Ghana"),
    (5.6037, -0.1870, 30, "flood", "Accra, Ghana"),
    (14.7167, -17.4677, 35, "flood", "Dakar, Senegal"),
    (12.6392, -8.0029, 40, "flood", "Bamako, Mali"),

    # ── East Africa ──
    (-6.7924, 39.2083, 30, "flood", "Dar es Salaam, Tanzania"),
    (-1.2921, 36.8219, 25, "flood", "Nairobi, Kenya"),
    (2.0469, 45.3182, 50, "flood", "Mogadishu, Somalia"),
    (9.0250, 38.7469, 30, "flood", "Addis Ababa, Ethiopia"),

    # ── Latin America ──
    (-23.5505, -46.6333, 40, "flood", "São Paulo, Brazil"),
    (-22.9068, -43.1729, 35, "flood", "Rio de Janeiro, Brazil"),
    (19.4326, -99.1332, 35, "flood", "Mexico City, Mexico"),
    (4.7110, -74.0721, 30, "flood", "Bogotá, Colombia"),
    (-12.0464, -77.0428, 30, "flood", "Lima, Peru"),
    (10.4806, -66.9036, 30, "flood", "Caracas, Venezuela"),
    (-34.6037, -58.3816, 30, "flood", "Buenos Aires, Argentina"),
    (18.4861, -69.9312, 40, "cyclone", "Santo Domingo, Dominican Republic"),
    (18.1096, -77.2975, 35, "cyclone", "Kingston, Jamaica"),

    # ── Middle East ──
    (25.2048, 55.2708, 30, "flood", "Dubai, UAE"),
    (24.7136, 46.6753, 25, "flood", "Riyadh, Saudi Arabia"),
    (29.3759, 47.9774, 25, "flood", "Kuwait City, Kuwait"),
]


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on Earth (km)."""
    R = 6371.0  # Earth's radius in km

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def get_historical_risk(lat: float, lon: float) -> Tuple[bool, dict]:
    """
    Check if a location is within proximity of a known disaster-prone zone.

    Returns:
        (is_at_risk: bool, details: dict)
        details contains: zone_name, risk_type, distance_km (if at risk)
    """
    closest_zone = None
    closest_distance = float("inf")

    for zone_lat, zone_lon, radius_km, risk_type, zone_name in DISASTER_ZONES:
        distance = _haversine_km(lat, lon, zone_lat, zone_lon)

        if distance < closest_distance:
            closest_distance = distance
            closest_zone = {
                "zone_name": zone_name,
                "risk_type": risk_type,
                "distance_km": round(distance, 1),
                "radius_km": radius_km,
            }

        if distance <= radius_km:
            return True, {
                "zone_name": zone_name,
                "risk_type": risk_type,
                "distance_km": round(distance, 1),
            }

    # Not in any zone, return closest for reference
    return False, {
        "nearest_zone": closest_zone["zone_name"] if closest_zone else "Unknown",
        "nearest_distance_km": round(closest_distance, 1) if closest_zone else None,
    }


def get_nearby_zones(lat: float, lon: float, max_distance_km: float = 200) -> list:
    """
    Get all disaster-prone zones within a given distance.
    Useful for context in the risk assessment.
    """
    nearby = []
    for zone_lat, zone_lon, radius_km, risk_type, zone_name in DISASTER_ZONES:
        distance = _haversine_km(lat, lon, zone_lat, zone_lon)
        if distance <= max_distance_km:
            nearby.append({
                "zone_name": zone_name,
                "risk_type": risk_type,
                "distance_km": round(distance, 1),
                "in_zone": distance <= radius_km,
            })

    return sorted(nearby, key=lambda x: x["distance_km"])
