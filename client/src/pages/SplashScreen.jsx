import { useNavigate } from 'react-router-dom'

export default function SplashScreen() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-screen bg-primary px-8 py-14 relative overflow-hidden select-none">
      {/* Decorative zigzag waves top-right */}
      <div className="absolute top-0 right-0 w-56 h-56 pointer-events-none">
        <svg viewBox="0 0 220 220" fill="none" className="w-full h-full opacity-20">
          {[0,18,36,54,72,90].map((o,i)=>(
            <polyline key={i}
              points={`${10+o},${60+o} ${40+o},${30+o} ${70+o},${60+o} ${100+o},${30+o} ${130+o},${60+o}`}
              stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"
            />
          ))}
        </svg>
      </div>

      {/* Content at bottom */}
      <div className="mt-auto mb-10 z-10">
        <h1 className="text-white text-[2rem] font-bold leading-snug mb-3">
          Manage What<br />To Do
        </h1>
        <p className="text-blue-200 text-sm leading-relaxed">
          The best way to manage what you have to do,<br />
          don't forget your plans.
        </p>
      </div>

      <button
        onClick={() => navigate('/home')}
        className="z-10 w-full py-4 bg-white text-primary font-semibold rounded-2xl text-base tracking-wide active:opacity-80 transition-opacity"
      >
        Get Started
      </button>
    </div>
  )
}
