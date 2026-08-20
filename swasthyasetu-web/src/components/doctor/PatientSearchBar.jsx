import React from 'react';

/**
 * PatientSearchBar — Prominent Health ID search bar at top of Doctor Workstation.
 * Features generous height input with Deep Teal focus state, quick-select patient pills,
 * and Soft Sage skeleton loading state.
 */
export default function PatientSearchBar({
  searchQuery,
  setSearchQuery,
  onSearch,
  isSearching,
  searchError,
  demoPatients = [],
  onSelectDemoPatient
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <div className="bg-white border border-[#E7F3EF] rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label 
            htmlFor="patient-health-id-search"
            className="font-display text-lg sm:text-xl font-bold text-[#1C2B2A] flex items-center gap-2"
          >
            <span className="w-3 h-3 rounded-full bg-[#0F6E5C]" />
            Patient Health ID Lookup
          </label>
          <p className="text-sm text-[#1C2B2A]/70 mt-1">
            Scan QR code or enter 14-digit ABDM Health ID / ABHA number to fetch history &amp; e-records.
          </p>
        </div>

        <span className="font-mono text-xs sm:text-sm text-[#0F6E5C] bg-[#E7F3EF] px-3 py-1.5 rounded-lg font-semibold self-start sm:self-auto border border-[#0F6E5C]/20">
          SCANNER ACTIVE (SCAN &amp; FETCH)
        </span>
      </div>

      {/* PROMINENT SEARCH INPUT FORM */}
      <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#0F6E5C]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <input
            id="patient-health-id-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type or scan Health ID (e.g. AB-9823-4011-9022)..."
            className="w-full pl-12 pr-28 py-3.5 bg-[#F7F6F3] border-2 border-[#1C2B2A]/15 rounded-xl text-lg sm:text-xl font-mono text-[#1C2B2A] placeholder:text-[#1C2B2A]/40 transition-all duration-150 focus:bg-white focus:outline-none focus:border-[#0F6E5C] focus:ring-2 focus:ring-[#E7F3EF]"
            aria-label="Patient Health ID Search Input"
          />

          <div className="absolute right-3 top-3 flex items-center gap-1.5">
            <span className="hidden sm:inline-block font-mono text-xs text-[#1C2B2A]/50 bg-[#1C2B2A]/5 px-2.5 py-1 rounded">
              ABHA ID
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSearching || !searchQuery.trim()}
          className="py-3.5 px-6 bg-[#0F6E5C] hover:bg-[#0c594a] text-white font-display font-semibold text-base sm:text-lg rounded-xl transition-all duration-150 active:scale-98 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#0F6E5C] focus:ring-offset-2 shrink-0 flex items-center justify-center gap-2"
        >
          {isSearching ? (
            <span>Searching...</span>
          ) : (
            <>
              <span>Fetch History</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* QUICK DEMO PATIENT SELECTION PILLS */}
      <div className="pt-1 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-mono text-xs sm:text-sm text-[#1C2B2A]/60 uppercase tracking-wider font-semibold">
          Quick Demo Patients:
        </span>
        {demoPatients.map((patient) => (
          <button
            key={patient.id}
            type="button"
            onClick={() => onSelectDemoPatient(patient)}
            className="px-3.5 py-1.5 bg-[#E7F3EF] hover:bg-[#0F6E5C] hover:text-white text-[#0F6E5C] font-mono text-xs sm:text-sm rounded-lg transition-all duration-150 active:scale-98 border border-[#0F6E5C]/20 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#0F6E5C]"
          >
            <span className="font-sans font-medium text-[#1C2B2A] hover:text-white">{patient.name}</span>
            <span className="opacity-75">({patient.healthId})</span>
          </button>
        ))}
      </div>

      {/* INLINE SEARCH ERROR / 404 PATIENT NOT FOUND */}
      {searchError && !isSearching && (
        <div className="mt-3 p-4 bg-[#C9754A]/10 border border-[#C9754A]/30 rounded-xl flex items-center gap-3 text-[#C9754A] font-mono text-sm">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-semibold">{searchError}</span>
        </div>
      )}

      {/* SKELETON LOADING STATE (PULSING SOFT SAGE) */}
      {isSearching && (
        <div 
          aria-live="polite" 
          aria-label="Loading patient record" 
          className="mt-4 p-4 bg-[#E7F3EF]/40 border border-[#0F6E5C]/20 rounded-xl space-y-3 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="h-6 bg-[#E7F3EF] rounded w-1/3"></div>
            <div className="h-5 bg-[#E7F3EF] rounded w-1/6"></div>
          </div>
          <div className="h-5 bg-[#E7F3EF] rounded w-2/3"></div>
          <div className="grid grid-cols-4 gap-2 pt-2">
            <div className="h-12 bg-[#E7F3EF] rounded"></div>
            <div className="h-12 bg-[#E7F3EF] rounded"></div>
            <div className="h-12 bg-[#E7F3EF] rounded"></div>
            <div className="h-12 bg-[#E7F3EF] rounded"></div>
          </div>
        </div>
      )}
    </div>
  );
}
