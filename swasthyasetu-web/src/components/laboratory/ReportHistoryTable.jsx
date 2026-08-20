import React, { useState } from 'react';

/**
 * ReportHistoryTable — Searchable archive log of completed lab reports.
 * Features zebra-striping using Warm Fog (#F7F6F3) on alternate rows,
 * scannable IBM Plex Mono order ID columns, and Deep Teal (#0F6E5C) completed status indicators.
 * Clickable report link/file opens the uploaded report file URL.
 */
export default function ReportHistoryTable({ reports = [] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = reports.filter((rep) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (rep.id && rep.id.toLowerCase().includes(q)) ||
      (rep.patientName && rep.patientName.toLowerCase().includes(q)) ||
      (rep.healthId && rep.healthId.toLowerCase().includes(q)) ||
      (rep.testName && rep.testName.toLowerCase().includes(q)) ||
      (rep.doctorName && rep.doctorName.toLowerCase().includes(q))
    );
  });

  const handleOpenReport = (report) => {
    if (report.fileUrl) {
      window.open(report.fileUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Report file URL for ${report.fileName || report.id} is being processed or not available.`);
    }
  };

  return (
    <div className="bg-white border border-[#E7F3EF] rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
      
      {/* HEADER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C2B2A]/10 pb-4">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-[#1C2B2A] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#0F6E5C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Completed Diagnostic Report History Log
          </h2>
          <p className="text-xs sm:text-sm text-[#1C2B2A]/70 mt-0.5">
            Archived log of finalized lab results synced with ABDM Health Records.
          </p>
        </div>

        {/* SEARCH INPUT */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search completed logs..."
            className="w-full px-3.5 py-2 bg-[#F7F6F3] border border-[#1C2B2A]/20 rounded-xl text-xs sm:text-sm font-mono text-[#1C2B2A] placeholder:text-[#1C2B2A]/40 transition-colors focus:bg-white focus:outline-none focus:border-[#3B7A9E] focus:ring-2 focus:ring-[#E7F3EF]"
          />
        </div>
      </div>

      {/* ZEBRA-STRIPED TABLE */}
      <div className="overflow-x-auto border border-[#1C2B2A]/10 rounded-xl">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-[#F7F6F3] border-b border-[#1C2B2A]/10 text-xs font-mono text-[#1C2B2A]/70 uppercase tracking-wider">
              <th className="p-3.5 font-bold">Report ID</th>
              <th className="p-3.5 font-bold">Patient &amp; ABHA ID</th>
              <th className="p-3.5 font-bold">Diagnostic Investigation</th>
              <th className="p-3.5 font-bold">Ordering Physician</th>
              <th className="p-3.5 font-bold">Completed Date</th>
              <th className="p-3.5 font-bold">Status Badge</th>
              <th className="p-3.5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C2B2A]/10">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((rep, index) => {
                // Zebra striping using Warm Fog #F7F6F3 on alternate rows
                const isEven = index % 2 === 0;

                return (
                  <tr
                    key={rep.id}
                    className={`hover:bg-[#E7F3EF]/40 transition-colors ${
                      isEven ? 'bg-white' : 'bg-[#F7F6F3]/60'
                    }`}
                  >
                    {/* REPORT ID */}
                    <td className="p-3.5 font-mono font-bold text-[#3B7A9E] whitespace-nowrap">
                      {rep.id}
                    </td>

                    {/* PATIENT & HEALTH ID */}
                    <td className="p-3.5">
                      <div className="font-semibold text-[#1C2B2A]">{rep.patientName}</div>
                      <div className="font-mono text-xs text-[#0F6E5C] bg-[#E7F3EF] px-1.5 py-0.5 rounded border border-[#0F6E5C]/20 inline-block mt-0.5">
                        {rep.healthId}
                      </div>
                    </td>

                    {/* TEST NAME */}
                    <td className="p-3.5 font-medium text-[#1C2B2A]">
                      {rep.testName}
                      {rep.fileName && (
                        <div className="font-mono text-xs text-[#1C2B2A]/60 font-normal">
                          File: {rep.fileName}
                        </div>
                      )}
                    </td>

                    {/* ORDERING DOCTOR */}
                    <td className="p-3.5 font-mono text-xs text-[#1C2B2A]/80">
                      {rep.doctorName}
                    </td>

                    {/* COMPLETED DATE */}
                    <td className="p-3.5 font-mono text-xs text-[#1C2B2A]/70 whitespace-nowrap">
                      {rep.completedAt}
                    </td>

                    {/* DEEP TEAL COMPLETED STATUS BADGE (Nod to Doctor-side completed state) */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 bg-[#0F6E5C] text-white rounded-md shadow-xs flex items-center gap-1.5 w-fit">
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 01.293.707V19a2 2 0 01-2 2z" clipRule="evenodd" />
                        </svg>
                        <span>Completed</span>
                      </span>
                    </td>

                    {/* DOWNLOAD / VIEW ACTION */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenReport(rep)}
                        className="px-3 py-1.5 bg-[#E7F3EF] hover:bg-[#3B7A9E] hover:text-white text-[#3B7A9E] font-mono text-xs font-semibold rounded-lg transition-colors border border-[#3B7A9E]/25 active:scale-98 cursor-pointer"
                      >
                        ↓ View / Download Report
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#1C2B2A]/50 italic text-sm">
                  No completed report history logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
