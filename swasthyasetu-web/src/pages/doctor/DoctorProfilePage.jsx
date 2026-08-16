import React from 'react';

/**
 * DoctorProfilePage — Detailed credentials & OPD profile for Dr. Ananya Sharma.
 */
export default function DoctorProfilePage() {
  return (
    <div className="bg-white border border-[#E7F3EF] rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
      
      {/* PROFILE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1C2B2A]/10 pb-5 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#0F6E5C] text-white flex items-center justify-center font-display text-2xl font-bold shadow-sm">
            AS
          </div>
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1C2B2A]">
              Dr. Ananya Sharma
            </h2>
            <p className="text-sm font-mono text-[#0F6E5C] font-semibold mt-0.5">
              Senior Consultant Cardiology • MD, DM (Cardiology), FACC
            </p>
            <p className="text-xs sm:text-sm text-[#1C2B2A]/60 font-mono mt-0.5">
              Registration No: <span className="font-bold text-[#1C2B2A]">DOC-8841-IN</span> (Medical Council Verified)
            </p>
          </div>
        </div>

        <span className="font-mono text-xs sm:text-sm bg-[#E7F3EF] text-[#0F6E5C] border border-[#0F6E5C]/30 px-3.5 py-1.5 rounded-lg font-semibold self-start sm:self-auto">
          ABDM CERTIFIED PHYSICIAN
        </span>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CLINICAL AFFILIATION & OPD SCHEDULE */}
        <div className="bg-[#F7F6F3] p-4.5 rounded-xl border border-[#1C2B2A]/10 space-y-3">
          <h3 className="font-display font-bold text-base sm:text-lg text-[#1C2B2A] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#0F6E5C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h1m-1-4h.01M9 16h.01M9 12h.01M9 8h.01M15 16h.01M15 12h.01M15 8h.01" />
            </svg>
            Hospital &amp; OPD Terminal Setup
          </h3>
          <div className="space-y-2 text-sm font-mono text-[#1C2B2A]">
            <div className="flex justify-between border-b border-[#1C2B2A]/10 pb-1.5">
              <span className="text-[#1C2B2A]/60">Facility:</span>
              <span className="font-bold">AIIMS OPD Terminal-4</span>
            </div>
            <div className="flex justify-between border-b border-[#1C2B2A]/10 pb-1.5">
              <span className="text-[#1C2B2A]/60">Department:</span>
              <span className="font-bold">Cardiovascular Sciences</span>
            </div>
            <div className="flex justify-between border-b border-[#1C2B2A]/10 pb-1.5">
              <span className="text-[#1C2B2A]/60">OPD Shift Hours:</span>
              <span className="font-bold">Mon - Fri (09:00 AM - 04:00 PM)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#1C2B2A]/60">E-Prescription Key:</span>
              <span className="text-[#0F6E5C] font-bold">RSA-2048 (ACTIVE)</span>
            </div>
          </div>
        </div>

        {/* ABDM SYSTEM CONFIGURATION */}
        <div className="bg-[#F7F6F3] p-4.5 rounded-xl border border-[#1C2B2A]/10 space-y-3">
          <h3 className="font-display font-bold text-base sm:text-lg text-[#1C2B2A] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#0F6E5C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            ABDM Node &amp; Telemetry Integration
          </h3>
          <div className="space-y-2 text-sm font-mono text-[#1C2B2A]">
            <div className="flex justify-between border-b border-[#1C2B2A]/10 pb-1.5">
              <span className="text-[#1C2B2A]/60">Gateway Status:</span>
              <span className="text-[#0F6E5C] font-bold">CONNECTED (ND-PHYS-04)</span>
            </div>
            <div className="flex justify-between border-b border-[#1C2B2A]/10 pb-1.5">
              <span className="text-[#1C2B2A]/60">HPR ID:</span>
              <span className="font-bold">dr.ananya@hpr.abdm</span>
            </div>
            <div className="flex justify-between border-b border-[#1C2B2A]/10 pb-1.5">
              <span className="text-[#1C2B2A]/60">AI Safety Node:</span>
              <span className="text-[#0F6E5C] font-bold">Protocol-v2.6 Enabled</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#1C2B2A]/60">Digital Signature:</span>
              <span className="text-[#0F6E5C] font-bold">Hardware Token Verified</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
