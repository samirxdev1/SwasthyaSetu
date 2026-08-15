import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 space-y-6 text-center">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Tailwind CSS Verified
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
          SwasthyaSetu Web
        </h1>
        <p className="text-slate-400 text-sm">
          Healthcare Portal for Doctors &amp; Laboratories
        </p>

        {/* Interactive Button */}
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/60 space-y-3">
          <p className="text-slate-300 text-sm font-medium">Interactive Test State</p>
          <button
            onClick={() => setCount((c) => c + 1)}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-semibold rounded-lg shadow-lg hover:shadow-cyan-500/20 transition-all duration-200 active:scale-95"
          >
            Counter Test: {count}
          </button>
        </div>

        {/* Test Cards Grid */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="bg-slate-700/40 p-3 rounded-lg border border-slate-600/40">
            <span className="text-blue-400 text-xs font-semibold block uppercase">Dashboard</span>
            <span className="text-white font-medium text-sm">Doctor View</span>
          </div>
          <div className="bg-slate-700/40 p-3 rounded-lg border border-slate-600/40">
            <span className="text-teal-400 text-xs font-semibold block uppercase">Dashboard</span>
            <span className="text-white font-medium text-sm">Lab View</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

