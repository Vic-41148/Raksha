# 🛡️ Raksha — Safe Daily Decision

> **Raksha** (रक्षा) means *protection* in Sanskrit.  
> One AI-powered safety decision for your family — based on real-time weather, flood risk, and historical disaster data.

**Live demo:** https://raksha-3x5w.vercel.app/  
Made for **WeatherWise Hack** · Team Code: **WWH-RHV8D6**

---

## 🌦️ What It Does

Raksha answers one critical question every morning:

> *"Is it safe to go outside today?"*

It fetches hyperlocal weather data, runs a trained ML model, and asks Groq LLaMA 3.3-70b to generate one clear, actionable safety decision for your household — factoring in children, elderly members, historical disaster zones, and real-time conditions.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🌡️ **Live Risk Score** | 0–10 score from rainfall, wind, humidity, elevation & historical zone data |
| 🤖 **AI Recommendation** | One plain-English safety sentence from Groq LLaMA 3.3 |
| 💬 **Safety Chatbot** | Context-aware AI assistant that knows your location, weather & risk |
| 🗺️ **Risk Zones Map** | Nearest historical disaster zones with distance & type |
| 📞 **Local Helplines** | GPS-detected emergency numbers (100+ countries) |
| 📤 **Share Status** | Share to WhatsApp, Telegram, Twitter with one tap |
| 👨‍👩‍👧 **Family Profile** | Children/elderly toggles amplify risk score (×1.4–1.6×) |
| 🌙 **Dark/Light Mode** | Material 3 dynamic colour palette that shifts with risk level |
| 📱 **Responsive** | Mobile-first + desktop sidebar nav rail |

---

## 🧠 Tracks

- ✅ **Weather Intelligence** — Hyperlocal OWM data + elevation
- ✅ **Disaster Alerts & Response** — Historical flood zone lookup
- ✅ **AI & Data Innovation** — scikit-learn Random Forest + Groq LLaMA 3.3

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Vanilla CSS (Material 3) |
| AI Decisions | Groq API (LLaMA 3.3-70b-versatile) |
| Weather | OpenWeatherMap API (current + elevation) |
| ML Model | scikit-learn Random Forest Classifier |
| Backend | FastAPI + Uvicorn |
| Database | SQLite (alert history) |
| Auth | Google OAuth (optional) |
| Deploy | Vercel (frontend) + Render (backend) |

---

## 🚀 Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Clone
```bash
git clone https://github.com/YOUR_USERNAME/Raksha.git
cd Raksha
```

### 2. Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Create backend/.env
cp .env.example .env  # then add your API keys
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

**`backend/.env`**
```
OPENWEATHERMAP_API_KEY=your_owm_key
GROQ_API_KEY=your_groq_key
```

### 3. Frontend
```bash
cd frontend
npm install

# Optional: add Google OAuth
cp .env.example .env  # set VITE_GOOGLE_CLIENT_ID

npm run dev
```

Open http://localhost:5173

### Or just run both with:
```bash
chmod +x run.sh && ./run.sh
```

---

## 🌐 Deployment

| Service | URL |
|---|---|
| Frontend (Vercel) | https://raksha-3x5w.vercel.app/ |
| Backend (Render) | https://raksha-backend-4br1.onrender.com |

> ⚠️ Render free tier spins down after inactivity — first request may take ~30s.

---

## 📁 Project Structure

```
Raksha/
├── backend/
│   ├── app/
│   │   ├── api.py          # FastAPI routes (risk, weather, helplines, chat)
│   │   ├── ml.py           # Random Forest model + profile modifier
│   │   ├── main.py         # App entry + CORS
│   │   └── models/
│   │       └── risk_model.pkl   # Trained RF model
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── tabs/           # SafetyTab, ChatTab, ZonesTab, SettingsTab, CreditsTab
│   │   ├── components/     # LoginScreen, OnboardingScreen, ScoreRing
│   │   ├── App.tsx         # Root + nav rail
│   │   └── index.css       # Material 3 design system
│   └── vercel.json         # API proxy → Render
└── run.sh                  # One-command local start
```

---

## 🏆 WeatherWise Hack 2026

Made for **WeatherWise Hack** by **zorozamarimo**  
Team Code: **WWH-RHV8D6** · Last 3: **D6** (code suffix)

> *"Made for WeatherWise Hack"*

---

## 📄 License

MIT — see [LICENSE](LICENSE)
