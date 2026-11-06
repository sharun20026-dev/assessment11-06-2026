import { Routes, Route } from 'react-router-dom'
import SplashScreen from './pages/SplashScreen'
import HomeScreen from './pages/HomeScreen'
import SearchScreen from './pages/SearchScreen'

export default function App() {
  return (
    // On mobile: full screen. On desktop: centered phone frame
    <div className="min-h-screen bg-slate-200 flex items-start justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-white shadow-2xl relative">
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/search" element={<SearchScreen />} />
        </Routes>
      </div>
    </div>
  )
}
