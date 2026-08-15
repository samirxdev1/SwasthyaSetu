import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#1C2B2A] p-6 font-body">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b border-[#0F6E5C]/20 pb-4">
          <div>
            <div className="inline-block px-2.5 py-0.5 bg-[#0F6E5C] text-white text-xs font-mono rounded font-semibold uppercase">
              Doctor Workstation
            </div>
            <h1 className="text-2xl font-display font-bold text-[#1C2B2A] mt-1">
              Doctor Clinical Portal
            </h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-3 py-1.5 border border-[#1C2B2A]/20 hover:bg-[#E7F3EF] text-xs font-mono rounded transition-colors"
          >
            End Session
          </button>
        </header>

        <main className="bg-white border border-[#0F6E5C]/30 p-6 rounded-lg shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#0F6E5C] font-mono text-sm font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F6E5C] animate-pulse"></span>
            AUTHENTICATED: DR. A. SHARMA (REG: DOC-8841-IN)
          </div>
          <p className="text-sm text-[#1C2B2A]/70">
            Welcome to the clinical workflow terminal. Patient search, e-prescription, and AI drug-interaction monitor ready.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-[#F7F6F3] p-4 rounded border border-[#1C2B2A]/10">
              <span className="font-mono text-xs text-[#1C2B2A]/50 block">ACTIVE PATIENTS</span>
              <span className="text-xl font-display font-bold text-[#0F6E5C]">14 Queued</span>
            </div>
            <div className="bg-[#F7F6F3] p-4 rounded border border-[#1C2B2A]/10">
              <span className="font-mono text-xs text-[#1C2B2A]/50 block">PENDING LAB ORDERS</span>
              <span className="text-xl font-[#1C2B2A] font-display font-bold text-[#3B7A9E]">8 Reports Ready</span>
            </div>
            <div className="bg-[#F7F6F3] p-4 rounded border border-[#1C2B2A]/10">
              <span className="font-mono text-xs text-[#1C2B2A]/50 block">AI DRUG SAFETY</span>
              <span className="text-xl font-display font-bold text-[#0F6E5C]">0 Conflicts</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
