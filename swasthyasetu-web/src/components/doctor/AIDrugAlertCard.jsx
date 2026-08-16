import React, { useState } from 'react';

/**
 * AIDrugAlertCard — AI Drug-Interaction & Contraindication Alert.
 * Displays when a prescribed medication conflicts with existing conditions or medications.
 * Features a distinct Muted Clay (#C9754A) left-border accent with 50ms staggered entrance,
 * plain-language clinical explanation, and "Doctor Acknowledged" confirmation flow.
 */
export default function AIDrugAlertCard({ alertData, onAcknowledge, onApplyAlternative }) {
  const [acknowledged, setAcknowledged] = useState(false);

  if (!alertData) return null;

  const handleConfirm = () => {
    setAcknowledged(true);
    if (onAcknowledge) {
      onAcknowledge(alertData);
    }
  };

  return (
    <div 
      className="bg-white border border-[#C9754A]/30 rounded-xl shadow-md overflow-hidden animate-entrance"
      style={{ animationDuration: '200ms' }}
    >
      <div className="flex">
        {/* STAGGERED MUTED CLAY LEFT BORDER ACCENT (50ms staggered entry effect) */}
        <div 
          className="w-2.5 bg-[#C9754A] shrink-0 transition-all duration-300"
          style={{ animationDelay: '50ms' }}
        />

        <div className="p-5 sm:p-6 flex-1 space-y-4">
          
          {/* HEADER & SEVERITY TAG */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C2B2A]/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#C9754A]/15 border border-[#C9754A]/30 text-[#C9754A] flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#1C2B2A]">
                    AI Clinical Safety Alert: Drug Interaction Detected
                  </h3>
                  <span className="font-mono text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-[#C9754A]/15 text-[#C9754A] border border-[#C9754A]/30">
                    {alertData.severity || 'MODERATE-HIGH RISK'}
                  </span>
                </div>
                <span className="font-mono text-xs sm:text-sm text-[#1C2B2A]/60 block mt-1">
                  ABDM Clinical Decision Support Node • Protocol-v2.6
                </span>
              </div>
            </div>

            {acknowledged && (
              <span className="font-mono text-xs sm:text-sm font-semibold text-[#0F6E5C] bg-[#E7F3EF] border border-[#0F6E5C]/30 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                <svg className="w-4 h-4 text-[#0F6E5C]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Doctor Acknowledged &amp; Verified</span>
              </span>
            )}
          </div>

          {/* FLAGGED DRUG COMBINATION BANNER */}
          <div className="bg-[#F7F6F3] border border-[#1C2B2A]/10 p-4 rounded-xl font-mono text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[#1C2B2A]/60 uppercase block text-xs font-semibold">FLAGGED PAIR / COMBINATION:</span>
              <span className="font-bold text-[#C9754A] text-base">{alertData.flaggedPair}</span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[#1C2B2A]/60 uppercase block text-xs font-semibold">PATIENT CONDITION:</span>
              <span className="font-semibold text-[#1C2B2A]">{alertData.patientCondition || 'Hypertension & Asthma'}</span>
            </div>
          </div>

          {/* CLEAR PLAIN-LANGUAGE AI EXPLANATION */}
          <div className="space-y-2 text-sm sm:text-base text-[#1C2B2A] leading-relaxed">
            <h4 className="font-display font-semibold text-[#1C2B2A] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9754A]" />
              Mechanism &amp; Clinical Impact:
            </h4>
            <p className="bg-[#C9754A]/5 p-4 rounded-lg border border-[#C9754A]/20 font-sans text-[#1C2B2A]/90 text-sm sm:text-base leading-relaxed">
              {alertData.explanation}
            </p>
          </div>

          {/* AI ALTERNATIVE SUGGESTION */}
          {alertData.alternative && (
            <div className="p-4 bg-[#E7F3EF]/60 border border-[#0F6E5C]/20 rounded-xl text-sm space-y-1.5">
              <div className="flex items-center gap-2 font-display font-semibold text-[#0F6E5C]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>AI Recommended Alternative Protocol:</span>
              </div>
              <p className="text-[#1C2B2A]/90 font-mono text-sm leading-relaxed">
                {alertData.alternative}
              </p>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
            {alertData.alternative && onApplyAlternative && (
              <button
                type="button"
                onClick={() => onApplyAlternative(alertData.alternativeDrugObj)}
                className="px-4 py-2.5 bg-[#0F6E5C] hover:bg-[#0c594a] text-white font-mono text-sm font-semibold rounded-lg transition-all duration-150 active:scale-98 focus:outline-none focus:ring-2 focus:ring-[#0F6E5C]"
              >
                ✓ Replace with Safe Alternative ({alertData.alternativeDrugName || 'Clopidogrel'})
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              className={`px-4 py-2.5 font-mono text-sm font-semibold rounded-lg transition-all duration-150 active:scale-98 focus:outline-none focus:ring-2 ${
                acknowledged
                  ? 'bg-[#1C2B2A]/10 text-[#1C2B2A]/60 border border-[#1C2B2A]/20 cursor-default'
                  : 'bg-white border border-[#C9754A] text-[#C9754A] hover:bg-[#C9754A]/10'
              }`}
            >
              {acknowledged ? '✓ Risk Acknowledged' : 'Doctor Acknowledged & Keep Current Rx'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
