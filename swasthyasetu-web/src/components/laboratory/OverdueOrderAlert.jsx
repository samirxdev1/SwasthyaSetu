import React from 'react';

/**
 * OverdueOrderAlert — Urgent / STAT Order Triage Indicator.
 * Features a distinct Muted Clay (#C9754A) left-border accent with 50ms staggered entrance,
 * mirror-matching the Doctor Dashboard's drug-interaction alert interaction pattern.
 */
export default function OverdueOrderAlert({ overdueOrders = [], onSelectOrder }) {
  if (!overdueOrders || overdueOrders.length === 0) return null;

  const urgentCount = overdueOrders.length;
  const primaryOrder = overdueOrders[0];

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

        <div className="p-4 sm:p-5 flex-1 space-y-3">
          
          {/* HEADER & URGENCY TAG */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1C2B2A]/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C9754A]/15 border border-[#C9754A]/30 text-[#C9754A] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-bold text-[#1C2B2A]">
                    Triage Alert: {urgentCount} Urgent / STAT {urgentCount === 1 ? 'Order' : 'Orders'} Pending
                  </span>
                  <span className="font-mono text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#C9754A]/15 text-[#C9754A] border border-[#C9754A]/30">
                    ACTION REQUIRED
                  </span>
                </div>
                <span className="font-mono text-xs text-[#1C2B2A]/70 block mt-0.5">
                  Orders exceeded normal 30m pending threshold or tagged STAT by attending physician.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectOrder && onSelectOrder(primaryOrder)}
              className="px-4 py-2 bg-[#C9754A] hover:bg-[#b0623a] text-white font-mono text-xs font-semibold rounded-lg transition-all duration-150 active:scale-98 focus:outline-none focus:ring-2 focus:ring-[#C9754A] self-start sm:self-auto flex items-center gap-1.5"
            >
              <span>Process High Priority ({primaryOrder.id})</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {/* PRIMARY OVERDUE ORDER PREVIEW BANNER */}
          <div className="bg-[#F7F6F3] border border-[#1C2B2A]/10 p-3 rounded-xl font-mono text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#C9754A]">{primaryOrder.id}</span>
              <span className="text-[#1C2B2A]/30">|</span>
              <span className="font-bold text-[#1C2B2A]">{primaryOrder.testName}</span>
              <span className="text-[#1C2B2A]/30">|</span>
              <span className="text-[#1C2B2A]/70">{primaryOrder.patientName}</span>
              <span className="text-[#0F6E5C] text-xs font-semibold">({primaryOrder.healthId})</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#1C2B2A]/60">Ordered by: <strong>{primaryOrder.doctorName}</strong></span>
              <span className="px-2 py-0.5 bg-[#C9754A]/20 text-[#C9754A] font-bold rounded">
                TAG: {primaryOrder.priority || 'STAT'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
