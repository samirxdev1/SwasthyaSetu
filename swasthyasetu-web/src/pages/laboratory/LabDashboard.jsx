import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLab } from '../../context/LabContext';
import IncomingOrdersQueue from '../../components/laboratory/IncomingOrdersQueue';
import OrderDetailModal from '../../components/laboratory/OrderDetailModal';
import OverdueOrderAlert from '../../components/laboratory/OverdueOrderAlert';
import ReportUploadPanel from '../../components/laboratory/ReportUploadPanel';

export default function LabDashboard() {
  const navigate = useNavigate();
  const {
    orders,
    isLoading,
    feedback,
    handleAcceptOrder,
    handleUploadReport,
  } = useLab();

  // Selection and modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [uploadTargetOrder, setUploadTargetOrder] = useState(null);
  const [showUploadPanel, setShowUploadPanel] = useState(false);

  // Overdue / Urgent orders filtering
  const overdueOrders = orders.filter(o => (o.isOverdue || o.priority === 'STAT') && o.status !== 'Completed');

  // Compute status summary counts
  const pendingCount = orders.filter(o => o.isUnassigned || o.status === 'Pending').length;
  const inProgressCount = orders.filter(o => o.status === 'In Progress').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;
  const statCount = overdueOrders.length;

  // Handle status toggle / accept order
  const handleStatusChange = async (orderId, newStatus) => {
    const target = orders.find(o => o.id === orderId);
    if (!target) return;

    if (target.isUnassigned || target.status === 'Pending') {
      await handleAcceptOrder(orderId);
    }
  };

  // Handle report upload completion
  const handleUploadSuccess = async (orderId, file, summary) => {
    const result = await handleUploadReport(orderId, file, summary);
    if (result) {
      setShowUploadPanel(false);
      setUploadTargetOrder(null);
    }
  };

  return (
    <div className="space-y-6 animate-entrance">
      
      {/* REAL-TIME FEEDBACK / TOAST NOTIFICATION */}
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

      {/* COLD START / INITIAL FETCH LOADING STATE */}
      {isLoading && orders.length === 0 && (
        <div className="p-4 bg-[#E7F3EF]/60 border border-[#3B7A9E]/30 rounded-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#3B7A9E] animate-ping" />
            <span className="font-mono text-xs sm:text-sm font-semibold text-[#3B7A9E]">
              Connecting to SwasthyaSetu Server &amp; Syncing Laboratory Orders Queue...
            </span>
          </div>
          <span className="font-mono text-xs text-[#3B7A9E]">RENDER GATEWAY LIVE</span>
        </div>
      )}

      {/* 1. QUICK-GLANCE SUMMARY STRIP AT VERY TOP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* PENDING ORDERS STAT CARD */}
        <div 
          onClick={() => navigate('/laboratory/orders')}
          className="bg-white p-4 rounded-xl border border-[#E7F3EF] shadow-sm flex items-center justify-between cursor-pointer hover:border-[#3B7A9E]/40 transition-colors"
        >
          <div>
            <span className="font-mono text-xs text-[#1C2B2A]/70 block uppercase font-semibold">
              Pending Orders Queue
            </span>
            <span className="font-display text-2xl font-bold text-[#1C2B2A]">
              {pendingCount} Orders
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F7F6F3] border border-[#1C2B2A]/15 text-[#1C2B2A] flex items-center justify-center font-mono font-bold text-sm">
            QUE
          </div>
        </div>

        {/* IN PROGRESS STAT CARD */}
        <div 
          onClick={() => navigate('/laboratory/orders')}
          className="bg-white p-4 rounded-xl border border-[#E7F3EF] shadow-sm flex items-center justify-between cursor-pointer hover:border-[#3B7A9E]/40 transition-colors"
        >
          <div>
            <span className="font-mono text-xs text-[#1C2B2A]/70 block uppercase font-semibold">
              In Processing
            </span>
            <span className="font-display text-2xl font-bold text-[#3B7A9E]">
              {inProgressCount} Processing
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#3B7A9E]/15 border border-[#3B7A9E]/30 text-[#3B7A9E] flex items-center justify-center font-mono font-bold text-sm">
            LAB
          </div>
        </div>

        {/* COMPLETED TODAY STAT CARD */}
        <div 
          onClick={() => navigate('/laboratory/reports')}
          className="bg-white p-4 rounded-xl border border-[#E7F3EF] shadow-sm flex items-center justify-between cursor-pointer hover:border-[#0F6E5C]/40 transition-colors"
        >
          <div>
            <span className="font-mono text-xs text-[#1C2B2A]/70 block uppercase font-semibold">
              Completed Today
            </span>
            <span className="font-display text-2xl font-bold text-[#0F6E5C]">
              {completedCount} Reports
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E7F3EF] border border-[#0F6E5C]/30 text-[#0F6E5C] flex items-center justify-center font-mono font-bold text-sm">
            ABHA
          </div>
        </div>

        {/* STAT / OVERDUE STAT CARD */}
        <div 
          onClick={() => navigate('/laboratory/orders')}
          className="bg-white p-4 rounded-xl border border-[#E7F3EF] shadow-sm flex items-center justify-between cursor-pointer hover:border-[#C9754A]/40 transition-colors"
        >
          <div>
            <span className="font-mono text-xs text-[#1C2B2A]/70 block uppercase font-semibold">
              STAT / Overdue Triage
            </span>
            <span className="font-display text-2xl font-bold text-[#C9754A]">
              {statCount} High Priority
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#C9754A]/15 border border-[#C9754A]/30 text-[#C9754A] flex items-center justify-center font-mono font-bold text-sm">
            STAT
          </div>
        </div>

      </div>

      {/* 2. OVERDUE / STAT ORDER ALERT INDICATOR */}
      <OverdueOrderAlert
        overdueOrders={overdueOrders}
        onSelectOrder={(ord) => setSelectedOrder(ord)}
      />

      {/* 3. RECENT INCOMING ORDERS QUEUE */}
      <IncomingOrdersQueue
        orders={orders}
        onSelectOrder={(ord) => setSelectedOrder(ord)}
        onStatusChange={handleStatusChange}
        onUploadReport={(ord) => {
          setUploadTargetOrder(ord);
          setShowUploadPanel(true);
        }}
      />

      {/* REPORT UPLOAD PANEL MODAL */}
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
