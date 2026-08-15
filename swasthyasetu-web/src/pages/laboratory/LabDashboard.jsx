import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LabDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#1C2B2A] p-6 font-body">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b border-[#3B7A9E]/20 pb-4">
          <div>
            <div className="inline-block px-2.5 py-0.5 bg-[#3B7A9E] text-white text-xs font-mono rounded font-semibold uppercase">
              Laboratory Workstation
            </div>
            <h1 className="text-2xl font-display font-bold text-[#1C2B2A] mt-1">
              Diagnostic Laboratory Portal
            </h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-3 py-1.5 border border-[#1C2B2A]/20 hover:bg-[#E7F3EF] text-xs font-mono rounded transition-colors"
          >
            End Session
          </button>
        </header>

        <main className="bg-white border border-[#3B7A9E]/30 p-6 rounded-lg shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#3B7A9E] font-mono text-sm font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B7A9E] animate-pulse"></span>
            AUTHENTICATED: NABL LAB FACILITY (CODE: LAB-3021-SYS)
          </div>
          <p className="text-sm text-[#1C2B2A]/70">
            Welcome to the diagnostic laboratory interface. Test order processing and report verification queue ready.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-[#F7F6F3] p-4 rounded border border-[#1C2B2A]/10">
              <span className="font-mono text-xs text-[#1C2B2A]/50 block">PENDING TEST ORDERS</span>
              <span className="text-xl font-display font-bold text-[#3B7A9E]">23 Orders</span>
            </div>
            <div className="bg-[#F7F6F3] p-4 rounded border border-[#1C2B2A]/10">
              <span className="font-mono text-xs text-[#1C2B2A]/50 block">REPORTS UPLOADED</span>
              <span className="text-xl font-display font-bold text-[#0F6E5C]">142 Today</span>
            </div>
            <div className="bg-[#F7F6F3] p-4 rounded border border-[#1C2B2A]/10">
              <span className="font-mono text-xs text-[#1C2B2A]/50 block">QUALITY CONTROL</span>
              <span className="text-xl font-display font-bold text-[#3B7A9E]">NABL Verified</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
