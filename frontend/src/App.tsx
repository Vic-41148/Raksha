import { useState, useEffect } from 'react'
import { MapPin, AlertTriangle, CheckCircle, Phone, ChevronDown, Shield, Users } from 'lucide-react'
import axios from 'axios'

type RiskLevel = 'SAFE' | 'CAUTION' | 'DANGER'

interface RiskData {
  risk_level: RiskLevel
  score: number
  decision: string
  weather: {
    rainfall_mm: number
    humidity_pct: number
    wind_speed_kmh: number
    temp_c: number
    condition: string
  }
  elevation_m: number
}

interface UserConfig {
  kids_present: boolean
  elderly_present: boolean
  city: string
}

function App() {
  const [config, setConfig] = useState<UserConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<RiskData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('raksha_config')
    if (saved) {
      const parsed = JSON.parse(saved)
      setConfig(parsed)
      fetchRisk(parsed)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchRisk = async (userConfig: UserConfig) => {
    setLoading(true)
    try {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords
        await getRiskData(latitude, longitude, userConfig)
      }, () => {
        // Fallback to Delhi if geo fails
        getRiskData(28.6139, 77.2090, userConfig)
      })
    } catch (err) {
      setError('Could not connect to server.')
      setLoading(false)
    }
  }

  const getRiskData = async (lat: number, lon: number, userConfig: UserConfig) => {
    try {
      const res = await axios.post('/api/risk', {
        lat,
        lon,
        kids_present: userConfig.kids_present,
        elderly_present: userConfig.elderly_present
      })
      setData(res.data)
      localStorage.setItem('raksha_last_data', JSON.stringify(res.data))
      setLoading(false)
    } catch (err) {
      const cached = localStorage.getItem('raksha_last_data')
      if (cached) {
        setData(JSON.parse(cached))
        setError('offline')
      } else {
        setError('Could not fetch risk data.')
      }
      setLoading(false)
    }
  }

  const handleOnboarding = (newConfig: UserConfig) => {
    localStorage.setItem('raksha_config', JSON.stringify(newConfig))
    setConfig(newConfig)
    fetchRisk(newConfig)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-700 rounded-full mb-4"></div>
          <p className="text-slate-400 font-medium">Checking your area...</p>
        </div>
      </div>
    )
  }

  if (!config) {
    return <Onboarding onComplete={handleOnboarding} />
  }

  if (error && error !== 'offline' && !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-center">
        <AlertTriangle className="text-yellow-500 w-12 h-12 mb-4" />
        <p className="text-white font-bold text-xl mb-2">Something went wrong</p>
        <p className="text-slate-500 text-sm mb-6 max-w-xs">{error}</p>
        <button 
          onClick={() => fetchRisk(config)}
          className="bg-slate-700 text-white px-6 py-3 rounded-xl font-medium"
        >
          Try Again
        </button>
      </div>
    )
  }

  const getTheme = () => {
    if (!data) return { bg: 'bg-slate-700', text: 'text-white', icon: <AlertTriangle /> }
    switch(data.risk_level) {
      case 'DANGER': return { bg: 'bg-red-600', text: 'text-white', icon: <AlertTriangle /> }
      case 'CAUTION': return { bg: 'bg-yellow-500', text: 'text-white', icon: <AlertTriangle /> }
      default: return { bg: 'bg-green-600', text: 'text-white', icon: <CheckCircle /> }
    }
  }

  const theme = getTheme()

  return (
    <div className="min-h-screen max-w-[390px] mx-auto bg-slate-900 text-white p-6 flex flex-col overflow-x-hidden">
      <header className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center text-slate-400 text-sm mb-1">
            <MapPin size={14} className="mr-1" />
            <span>{config.city || 'Your Location'}</span>
          </div>
          <h2 className="font-bold text-lg uppercase tracking-tight">
            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </h2>
        </div>
        {error === 'offline' && (
          <div className="bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
            Offline Mode
          </div>
        )}
      </header>

      {data && (
        <main className="flex-grow">
          <div className={`${theme.bg} rounded-3xl p-8 mb-8 shadow-2xl transition-all`}>
            <div className="flex items-center gap-3 mb-4">
              {theme.icon}
              <span className="font-black text-2xl tracking-tight uppercase">
                {data.risk_level === 'SAFE' ? 'Safe' : data.risk_level === 'CAUTION' ? 'Caution' : 'Stay Home'}
              </span>
            </div>
            <h1 className="text-3xl font-black leading-tight">
              {data.risk_level === 'DANGER' ? 'HIGH FLOOD RISK' : data.risk_level === 'CAUTION' ? 'MODERATE RISK' : 'LOOKS CLEAR TODAY'}
            </h1>
          </div>

          <p className="text-xl font-medium leading-relaxed mb-8">
            {data.decision}
          </p>

          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-slate-400 font-bold mb-4 min-h-[48px]"
          >
            Why? <ChevronDown size={18} className={expanded ? 'rotate-180' : ''} />
          </button>

          {expanded && (
            <div className="bg-slate-800 rounded-2xl p-6 mb-8 grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Rainfall</span>
                <span className="text-lg font-bold">{data.weather.rainfall_mm}mm</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Elevation</span>
                <span className="text-lg font-bold">{data.elevation_m}m</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Risk Score</span>
                <span className="text-lg font-bold">{data.score.toFixed(1)}/10</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Wind</span>
                <span className="text-lg font-bold">{data.weather.wind_speed_kmh.toFixed(1)} km/h</span>
              </div>
            </div>
          )}
        </main>
      )}

      <footer className="mt-auto pt-6 flex flex-col gap-4">
        <div className="flex gap-4">
          <button className="flex-1 bg-green-600/20 text-green-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 min-h-[48px] border border-green-600/30">
            <CheckCircle size={18} /> I'm Safe
          </button>
          <button className="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 min-h-[48px]">
            <Phone size={18} /> Helpline
          </button>
        </div>
        <p className="text-[10px] text-slate-600 text-center font-medium tracking-widest uppercase pb-2">
          Made for WeatherWise Hack
        </p>
      </footer>
    </div>
  )
}

function Onboarding({ onComplete }: { onComplete: (config: UserConfig) => void }) {
  const [city, setCity] = useState('')
  const [kids, setKids] = useState(false)
  const [elderly, setElderly] = useState(false)

  return (
    <div className="min-h-screen max-w-[390px] mx-auto bg-slate-900 text-white p-8 flex flex-col justify-center overflow-x-hidden">
      <div className="mb-12">
        <Shield size={48} className="text-green-500 mb-6" />
        <h1 className="text-4xl font-black tracking-tight mb-4">Raksha</h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          One daily safety decision. Hyperlocal, profile-aware, radical simplicity.
        </p>
      </div>

      <div className="space-y-8 mb-12">
        <div>
          <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">Your City</label>
          <input 
            type="text" 
            placeholder="e.g. Manila, Philippines"
            className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white placeholder-slate-600 font-bold focus:ring-2 focus:ring-green-500 transition-all outline-none"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Family Profile</label>
          <div className="space-y-3">
            <button 
              onClick={() => setKids(!kids)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all min-h-[48px] ${kids ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              <div className="flex items-center gap-3">
                <Users size={20} />
                <span>Kids present</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${kids ? 'bg-white border-white' : 'border-slate-600'}`}></div>
            </button>

            <button 
              onClick={() => setElderly(!elderly)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all min-h-[48px] ${elderly ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              <div className="flex items-center gap-3">
                <Users size={20} />
                <span>Elderly present</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${elderly ? 'bg-white border-white' : 'border-slate-600'}`}></div>
            </button>
          </div>
        </div>
      </div>

      <button 
        disabled={!city}
        onClick={() => onComplete({ city, kids_present: kids, elderly_present: elderly })}
        className="w-full bg-green-600 disabled:opacity-50 disabled:bg-slate-800 py-5 rounded-3xl font-black text-xl shadow-xl active:scale-[0.98] transition-all min-h-[48px]"
      >
        Protect My Family
      </button>
    </div>
  )
}

export default App
