import React from 'react';
import { useLab } from '../../context/LabContext';
import ReportHistoryTable from '../../components/laboratory/ReportHistoryTable';

export default function ReportHistoryPage() {
  const { reportHistory, feedback } = useLab();

  return (
    <div className="space-y-6 animate-entrance">
      {/* FEEDBACK TOAST */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between font-mono text-xs sm:text-sm animate-entrance ${
            feedback.type === 'error'
              ? 'bg-[#C9754A]/10 border-[#C9754A]/30 text-[#C9754A]'
              : 'bg-[#E7F3EF] border-[#0F6E5C]/30 text-[#0F6E5C]'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {feedback.type === 'error' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      {/* REPORT HISTORY TABLE */}
      <ReportHistoryTable reports={reportHistory} />
    </div>
  );
}
