import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDoctor } from '../../context/DoctorContext';
import PatientSearchBar from '../../components/doctor/PatientSearchBar';
import PatientHistoryCard from '../../components/doctor/PatientHistoryCard';

/**
 * PatientRecordView — Dedicated Patient Search & Medical History page.
 * Uses PatientSearchBar to look up patient records and PatientHistoryCard to show full clinical timeline.
 */
export default function PatientRecordView() {
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    isSearching,
    searchError,
    selectedPatient,
    handleSearchPatient,
    handleSelectDemoPatient,
  } = useDoctor();

  const demoPatients = [
    { id: 'p1', name: 'Rajesh V. Kumar', healthId: 'ABDM-1786952428247' },
    { id: 'p2', name: 'Sunita Devi', healthId: '12345678901234' },
  ];

  return (
    <div className="space-y-6">
      
      {/* PATIENT SEARCH BAR */}
      <PatientSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearchPatient}
        isSearching={isSearching}
        searchError={searchError}
        demoPatients={demoPatients}
        onSelectDemoPatient={handleSelectDemoPatient}
      />

      {/* QUICK ACTION HEADER FOR CONSULTATION */}
      {selectedPatient && (
        <div className="bg-[#E7F3EF] border border-[#0F6E5C]/30 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#0F6E5C] animate-pulse shrink-0" />
            <div>
              <span className="font-display text-base sm:text-lg font-bold text-[#1C2B2A] block">
                Selected Patient: {selectedPatient.name} ({selectedPatient.healthId})
              </span>
              <span className="text-xs sm:text-sm text-[#1C2B2A]/70">
                Ready for clinical examination and e-prescribing
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/doctor/consultations')}
            className="px-5 py-2.5 bg-[#0F6E5C] hover:bg-[#0c594a] text-white font-display font-semibold text-sm rounded-lg transition-all duration-150 active:scale-98 focus:outline-none focus:ring-2 focus:ring-[#0F6E5C] shrink-0 flex items-center justify-center gap-2"
          >
            <span>Open Consultation Form</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}

      {/* PATIENT HISTORY CARD */}
      <PatientHistoryCard patient={selectedPatient} />

    </div>
  );
}
