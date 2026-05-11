# Raksha — Safe Daily Decision

One daily safety decision based on hyperlocal flood/heat/storm risk.

## Tech Stack
- **Frontend**: React + Vite + Tailwind (Mobile-first 390px)
- **Backend**: FastAPI
- **ML**: sklearn RandomForestRegressor
- **AI**: Groq llama-3.3-70b
- **DB**: SQLite

## Hackathon Info
- **Event**: WeatherWise Hack
- **Team Code**: WWH-RHV8D6
- **Mandatory Statement**: Made for WeatherWise Hack

## Installation

### Backend
1. `cd backend`
2. `python -m venv venv`
3. `source venv/bin/activate`
4. `pip install -r requirements.txt`
5. `python app/train_model.py`
6. `uvicorn app.main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
