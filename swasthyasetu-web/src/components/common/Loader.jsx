import React from 'react';

export default function Loader({ message = 'Synchronizing clinical workstation...' }) {
  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#1C2B2A] flex flex-col items-center justify-center p-6 font-body">
      <div className="flex flex-col items-center gap-4 bg-white border border-[#1C2B2A]/10 p-8 rounded-xl shadow-xs max-w-sm w-full text-center">
        <svg className="animate-spin h-10 w-10 text-[#0F6E5C]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="font-mono text-xs uppercase tracking-wider text-[#1C2B2A]/60 font-semibold">
          SYSTEM TELEMETRY
        </span>
        <p className="text-sm font-medium text-[#1C2B2A]">{message}</p>
      </div>
    </div>
  );
}
