import React from 'react';

/**
 * PatientHistoryCard — Displays patient demographic details, chronic conditions,
 * and a condensed consultation timeline with 30ms staggered item entry.
 */
export default function PatientHistoryCard({ patient }) {
  if (!patient) return null;

  return (
    <div className="bg-white border border-[#E7F3EF] rounded-xl p-5 sm:p-6 shadow-sm space-y-6 animate-entrance">
      
      {/* HEADER: PATIENT DEMOGRAPHICS & HEALTH ID */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-[#1C2B2A]/10 pb-5 gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1C2B2A]">
              {patient.name}
            </h2>
            <span className="text-sm px-2.5 py-1 rounded-md bg-[#E7F3EF] text-[#0F6E5C] font-semibold">
              {patient.gender}, {patient.age} yrs
            </span>
            <span className="text-sm px-2.5 py-1 rounded-md bg-[#1C2B2A]/5 text-[#1C2B2A]/70 font-mono">
              Blood: {patient.bloodGroup}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#1C2B2A]/70">
            <span>ABDM Health ID:</span>
            {/* Health ID uses IBM Plex Mono font-mono for tabular scannable feel */}
            <span className="font-mono text-sm font-semibold text-[#0F6E5C] bg-[#E7F3EF]/60 px-2.5 py-0.5 rounded border border-[#0F6E5C]/20 tracking-wider">
              {patient.healthId}
            </span>
          </div>
        </div>

        {/* VITALS TELEMETRY BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center bg-[#F7F6F3] p-3 rounded-xl border border-[#1C2B2A]/10 font-mono text-sm">
          <div className="px-2 border-r border-[#1C2B2A]/10 last:border-none">
            <span className="text-xs text-[#1C2B2A]/60 block uppercase font-semibold">BP</span>
            <span className="font-bold text-[#1C2B2A] text-sm sm:text-base">{patient.vitals?.bp || '120/80'}</span>
          </div>
          <div className="px-2 border-r border-[#1C2B2A]/10 last:border-none">
            <span className="text-xs text-[#1C2B2A]/60 block uppercase font-semibold">HEART RATE</span>
            <span className="font-bold text-[#0F6E5C] text-sm sm:text-base">{patient.vitals?.hr || '72 bpm'}</span>
          </div>
          <div className="px-2 border-r border-[#1C2B2A]/10 last:border-none">
            <span className="text-xs text-[#1C2B2A]/60 block uppercase font-semibold">SpO2</span>
            <span className="font-bold text-[#1C2B2A] text-sm sm:text-base">{patient.vitals?.spo2 || '98%'}</span>
          </div>
          <div className="px-2">
            <span className="text-xs text-[#1C2B2A]/60 block uppercase font-semibold">TEMP</span>
            <span className="font-bold text-[#1C2B2A] text-sm sm:text-base">{patient.vitals?.temp || '98.4°F'}</span>
          </div>
        </div>
      </div>

      {/* CHRONIC CONDITIONS TAGS */}
      <div>
        <span className="font-mono text-xs sm:text-sm text-[#1C2B2A]/60 font-semibold uppercase tracking-wider block mb-2.5">
          Known Chronic Conditions &amp; Allergies:
        </span>
        <div className="flex flex-wrap gap-2.5">
          {patient.conditions && patient.conditions.length > 0 ? (
            patient.conditions.map((cond, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 bg-[#E7F3EF] border border-[#0F6E5C]/25 text-[#0F6E5C] text-sm font-medium rounded-lg flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-[#0F6E5C]" />
                <span>{cond}</span>
              </span>
            ))
          ) : (
            <span className="text-sm text-[#1C2B2A]/50 italic">No chronic conditions recorded</span>
          )}

          {patient.allergies && patient.allergies.map((alg, idx) => (
            <span
              key={`alg-${idx}`}
              className="px-3.5 py-1.5 bg-[#C9754A]/15 border border-[#C9754A]/30 text-[#C9754A] text-sm font-semibold rounded-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Allergy: {alg}</span>
            </span>
          ))}
        </div>
      </div>

      {/* CONDENSED CONSULTATION TIMELINE WITH STAGGERED REVEAL */}
      <div className="space-y-4 pt-2 border-t border-[#1C2B2A]/10">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base sm:text-lg text-[#1C2B2A] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#0F6E5C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Past Consultation History
          </h3>
          <span className="font-mono text-xs sm:text-sm text-[#1C2B2A]/50">
            {patient.history ? patient.history.length : 0} Previous Visits
          </span>
        </div>

        <div className="space-y-3">
          {patient.history && patient.history.map((visit, index) => (
            <div
              key={visit.id || index}
              style={{ animationDelay: `${index * 30}ms` }}
              className="p-4 bg-[#F7F6F3] border border-[#1C2B2A]/10 rounded-xl space-y-2.5 hover:border-[#0F6E5C]/40 transition-colors animate-entrance"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-1.5">
                <div className="flex flex-wrap items-center gap-2 font-mono">
                  <span className="font-bold text-[#0F6E5C]">{visit.date}</span>
                  <span className="text-[#1C2B2A]/30">|</span>
                  <span className="text-[#1C2B2A]/80 font-sans font-medium">{visit.doctorName}</span>
                  <span className="text-[#1C2B2A]/30">|</span>
                  <span className="text-[#1C2B2A]/60 uppercase">{visit.clinic}</span>
                </div>
                <span className="font-mono text-xs bg-white px-2.5 py-1 rounded border border-[#1C2B2A]/10 text-[#1C2B2A]/80 self-start sm:self-auto font-medium">
                  {visit.visitType || 'Follow-up OPD'}
                </span>
              </div>

              <div className="text-sm text-[#1C2B2A] font-medium leading-normal">
                <span className="text-[#1C2B2A]/60 font-normal">Diagnosis: </span>
                <span>{visit.diagnosis}</span>
              </div>

              {visit.prescribedMeds && visit.prescribedMeds.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-sm pt-0.5">
                  <span className="font-mono text-xs text-[#1C2B2A]/50 uppercase font-semibold">Rx:</span>
                  {visit.prescribedMeds.map((med, mIdx) => (
                    <span key={mIdx} className="font-mono text-xs bg-white px-2.5 py-1 rounded-md border border-[#1C2B2A]/15 text-[#1C2B2A]/90 font-medium">
                      {med}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
