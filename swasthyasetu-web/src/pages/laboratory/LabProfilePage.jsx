import React from 'react';
import useAuth from '../../hooks/useAuth';

export default function LabProfilePage() {
  const { user } = useAuth();

  return (
    <div className="bg-white border border-[#E7F3EF] rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-entrance">
      <div className="flex items-center justify-between border-b border-[#1C2B2A]/10 pb-4">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-[#1C2B2A] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#3B7A9E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Diagnostic Laboratory Facility Profile
          </h2>
          <p className="text-xs sm:text-sm text-[#1C2B2A]/70 mt-0.5">
            Verified NABL accreditation credentials &amp; ABDM gateway health facility registry details.
          </p>
        </div>

        <span className="font-mono text-xs text-[#0F6E5C] bg-[#E7F3EF] border border-[#0F6E5C]/30 px-3 py-1 rounded-lg font-semibold">
          NABL ACCREDITED
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
        <div className="p-4 bg-[#F7F6F3] rounded-xl border border-[#1C2B2A]/10 space-y-2">
          <span className="font-mono text-xs text-[#1C2B2A]/60 font-semibold uppercase block">Facility Identifier</span>
          <div className="font-display font-bold text-base text-[#1C2B2A]">
            {user?.profile?.lab_name || 'Central Diagnostic Hub'}
          </div>
          <div className="font-mono text-xs text-[#3B7A9E]">
            Registration Number: {user?.profile?.registration_number || 'LAB-3021-SYS'}
          </div>
        </div>

        <div className="p-4 bg-[#F7F6F3] rounded-xl border border-[#1C2B2A]/10 space-y-2">
          <span className="font-mono text-xs text-[#1C2B2A]/60 font-semibold uppercase block">System Authentication</span>
          <div className="font-mono text-xs text-[#1C2B2A]">Email: {user?.email || 'lab@swasthyasetu.org'}</div>
          <div className="font-mono text-xs text-[#1C2B2A]">Phone: {user?.phone || '+91 9811223344'}</div>
          <div className="font-mono text-xs text-[#0F6E5C]">Status: Verified Workstation</div>
        </div>

        <div className="md:col-span-2 p-4 bg-[#F7F6F3] rounded-xl border border-[#1C2B2A]/10 space-y-2">
          <span className="font-mono text-xs text-[#1C2B2A]/60 font-semibold uppercase block">Facility Address &amp; Location</span>
          <p className="text-[#1C2B2A]/80">
            {user?.profile?.address || '45 Healthcare Blvd, Sector 62, Noida, Uttar Pradesh - 201301'}
          </p>
        </div>

        <div className="md:col-span-2 p-4 bg-[#E7F3EF]/50 rounded-xl border border-[#3B7A9E]/25 space-y-2">
          <span className="font-mono text-xs text-[#3B7A9E] font-semibold uppercase block">Services Offered &amp; Analyzer Equipment</span>
          <div className="flex flex-wrap gap-2 pt-1">
            {['Complete Blood Count (CBC)', 'Lipid Profile', 'Thyroid Panel', 'HbA1c Glucose', 'Renal Function', 'Liver Function', 'STAT Troponin I'].map((s) => (
              <span key={s} className="px-2.5 py-1 bg-white border border-[#3B7A9E]/30 text-[#3B7A9E] font-mono text-xs rounded-lg font-semibold">
                ✓ {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
