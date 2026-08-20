import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import ReportUploadPanel from '../../components/laboratory/ReportUploadPanel';

export default function ReportUploadPage() {
  const { orders, feedback, handleUploadReport } = useLab();
  const [selectedTarget, setSelectedTarget] = useState(null);

  const handleUploadSuccess = async (orderId, file, summary) => {
    return await handleUploadReport(orderId, file, summary);
  };

  const activeOrders = orders.filter(o => o.status === 'In Progress' || o.status === 'Pending');

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

      {/* REPORT UPLOAD PANEL */}
      <ReportUploadPanel
        targetOrder={selectedTarget}
        orders={orders}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* ACTIVE ORDERS LIST FOR QUICK SELECT */}
      <div className="bg-white border border-[#E7F3EF] rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
        <h3 className="font-display text-base font-bold text-[#1C2B2A] flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3B7A9E]" />
          Orders Awaiting Report Upload ({activeOrders.length})
        </h3>

        {activeOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeOrders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => setSelectedTarget(ord)}
                className={`p-3.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
                  selectedTarget?.id === ord.id
                    ? 'bg-[#3B7A9E]/10 border-[#3B7A9E] ring-1 ring-[#3B7A9E]'
                    : 'bg-[#F7F6F3] border-[#1C2B2A]/10 hover:border-[#3B7A9E]/40'
                }`}
              >
                <div className="flex justify-between items-start font-semibold text-[#1C2B2A]">
                  <span>{ord.testName}</span>
                  <span className="font-mono text-xs text-[#3B7A9E] bg-[#3B7A9E]/10 px-2 py-0.5 rounded">
                    {ord.status}
                  </span>
                </div>
                <div className="mt-1 font-mono text-xs text-[#1C2B2A]/70">
                  Patient: <strong className="text-[#1C2B2A]">{ord.patientName}</strong> ({ord.healthId})
                </div>
                <div className="mt-1 font-mono text-xs text-[#1C2B2A]/50 flex justify-between">
                  <span>Order ID: {ord.id.slice(0, 8)}...</span>
                  <span>{ord.orderedAt}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-[#1C2B2A]/50 italic">
            No active orders awaiting report upload at this moment.
          </p>
        )}
      </div>
    </div>
  );
}
