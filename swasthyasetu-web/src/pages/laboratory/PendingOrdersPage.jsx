import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import IncomingOrdersQueue from '../../components/laboratory/IncomingOrdersQueue';
import OrderDetailModal from '../../components/laboratory/OrderDetailModal';
import ReportUploadPanel from '../../components/laboratory/ReportUploadPanel';

export default function PendingOrdersPage() {
  const {
    orders,
    isLoading,
    feedback,
    handleAcceptOrder,
    handleUploadReport,
  } = useLab();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [uploadTargetOrder, setUploadTargetOrder] = useState(null);
  const [showUploadPanel, setShowUploadPanel] = useState(false);

  const handleStatusChange = async (orderId, newStatus) => {
    const target = orders.find(o => o.id === orderId);
    if (!target) return;

    if (target.isUnassigned || target.status === 'Pending') {
      await handleAcceptOrder(orderId);
    }
  };

  const handleUploadSuccess = async (orderId, file, summary) => {
    const result = await handleUploadReport(orderId, file, summary);
    if (result) {
      setShowUploadPanel(false);
      setUploadTargetOrder(null);
    }
  };

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

      {/* LOADING INDICATOR */}
      {isLoading && orders.length === 0 && (
        <div className="p-4 bg-[#E7F3EF]/60 border border-[#3B7A9E]/30 rounded-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#3B7A9E] animate-ping" />
            <span className="font-mono text-xs sm:text-sm font-semibold text-[#3B7A9E]">
              Fetching Diagnostic Test Orders Queue...
            </span>
          </div>
        </div>
      )}

      {/* INCOMING ORDERS QUEUE TABLE */}
      <IncomingOrdersQueue
        orders={orders}
        onSelectOrder={(ord) => setSelectedOrder(ord)}
        onStatusChange={handleStatusChange}
        onUploadReport={(ord) => {
          setUploadTargetOrder(ord);
          setShowUploadPanel(true);
        }}
      />

      {/* REPORT UPLOAD MODAL */}
      {showUploadPanel && (
        <div className="fixed inset-0 bg-[#1C2B2A]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-entrance overflow-y-auto">
          <div className="max-w-2xl w-full">
            <ReportUploadPanel
              targetOrder={uploadTargetOrder}
              orders={orders}
              onUploadSuccess={handleUploadSuccess}
              onClose={() => {
                setShowUploadPanel(false);
                setUploadTargetOrder(null);
              }}
            />
          </div>
        </div>
      )}

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          onOpenUpload={(ord) => {
            setUploadTargetOrder(ord);
            setShowUploadPanel(true);
          }}
        />
      )}
    </div>
  );
}
