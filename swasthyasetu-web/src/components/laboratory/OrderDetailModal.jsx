import React from 'react';

/**
 * OrderDetailModal — Expanded clinical order details view for Laboratory Workstation.
 * Displays patient demographics, IBM Plex Mono Health ID, test requested, doctor remarks,
 * and direct action buttons to toggle status or launch report upload.
 */
export default function OrderDetailModal({ order, onClose, onStatusChange, onOpenUpload }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-[#1C2B2A]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-entrance">
      <div className="bg-white border border-[#E7F3EF] rounded-xl max-w-xl w-full p-6 shadow-xl space-y-5 text-[#1C2B2A]">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-[#1C2B2A]/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[#3B7A9E] text-white">
              {order.id}
            </span>
            <h3 className="font-display text-lg font-bold text-[#1C2B2A]">
              Diagnostic Order Details
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#E7F3EF] text-[#1C2B2A]/60 hover:text-[#1C2B2A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B7A9E]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* PATIENT INFO BANNER */}
        <div className="bg-[#F7F6F3] p-4 rounded-xl border border-[#1C2B2A]/10 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-display font-bold text-base text-[#1C2B2A] block">
                {order.patientName}
              </span>
              <span className="font-mono text-xs text-[#0F6E5C] font-semibold bg-[#E7F3EF] px-2 py-0.5 rounded border border-[#0F6E5C]/20 inline-block mt-1">
                Health ID: {order.healthId}
              </span>
            </div>

            <span className={`font-mono text-xs font-bold px-2.5 py-1 rounded border ${
              order.priority === 'STAT'
                ? 'bg-[#C9754A] text-white border-[#C9754A]'
                : 'bg-[#3B7A9E]/15 text-[#3B7A9E] border-[#3B7A9E]/30'
            }`}>
              {order.priority || 'Routine'} Priority
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1C2B2A]/10 text-xs font-mono text-[#1C2B2A]/70">
            <div>Ordering Doctor: <strong className="text-[#1C2B2A]">{order.doctorName}</strong></div>
            <div>Facility: <strong className="text-[#1C2B2A]">{order.facility || 'AIIMS OPD-4'}</strong></div>
            <div>Order Date: <strong className="text-[#1C2B2A]">{order.orderedAt}</strong></div>
            <div>Current Status: <strong className="text-[#3B7A9E]">{order.status}</strong></div>
          </div>
        </div>

        {/* TEST DETAILS & SPECIMEN REQUIREMENTS */}
        <div className="space-y-3">
          <div>
            <span className="font-mono text-xs text-[#1C2B2A]/60 font-semibold uppercase block mb-1">
              Requested Investigation / Test:
            </span>
            <div className="p-3 bg-[#3B7A9E]/10 border border-[#3B7A9E]/25 rounded-xl font-display font-bold text-base text-[#3B7A9E]">
              {order.testName}
            </div>
          </div>

          {order.doctorNotes && (
            <div>
              <span className="font-mono text-xs text-[#1C2B2A]/60 font-semibold uppercase block mb-1">
                Attending Doctor Notes &amp; Indications:
              </span>
              <p className="p-3 bg-[#F7F6F3] border border-[#1C2B2A]/10 rounded-xl text-xs sm:text-sm text-[#1C2B2A]/90 italic">
                "{order.doctorNotes}"
              </p>
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="pt-3 border-t border-[#1C2B2A]/10 flex items-center justify-end gap-3">
          {order.status === 'Pending' && (
            <button
              type="button"
              onClick={() => {
                onStatusChange(order.id, 'In Progress');
                onClose();
              }}
              className="px-4 py-2 bg-[#3B7A9E] hover:bg-[#316583] text-white font-mono text-xs font-semibold rounded-xl transition-colors active:scale-98"
            >
              Start Processing (In Progress)
            </button>
          )}

          {order.status !== 'Completed' && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenUpload(order);
              }}
              className="px-4 py-2 bg-[#0F6E5C] hover:bg-[#0c594a] text-white font-mono text-xs font-semibold rounded-xl transition-colors active:scale-98"
            >
              + Upload Final Report PDF
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#F7F6F3] border border-[#1C2B2A]/20 text-[#1C2B2A] hover:bg-white font-mono text-xs rounded-xl transition-colors active:scale-98"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
