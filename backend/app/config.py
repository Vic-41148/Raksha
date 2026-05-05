import os
from dotenv import load_dotenv

load_dotenv()

OPENWEATHERMAP_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPEN_ELEVATION_API_URL = "https://api.open-elevation.com/api/v1/lookup"
DATABASE_URL = "sqlite:///./raksha.db"
