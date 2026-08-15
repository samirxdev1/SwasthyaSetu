import React, { useState } from 'react';
import LabLayout from '../../layouts/LabLayout';
import IncomingOrdersQueue from '../../components/laboratory/IncomingOrdersQueue';
import OrderDetailModal from '../../components/laboratory/OrderDetailModal';
import OverdueOrderAlert from '../../components/laboratory/OverdueOrderAlert';
import ReportUploadPanel from '../../components/laboratory/ReportUploadPanel';
import ReportHistoryTable from '../../components/laboratory/ReportHistoryTable';

/**
 * Demo Diagnostic Lab Mock Database
 */
const INITIAL_LAB_ORDERS = [
  {
    id: 'LAB-ORD-9023',
    patientName: 'Amit Patel',
    healthId: 'AB-7721-8890-3341',
    testName: '12-Lead ECG & Serum Trop-I',
    specimen: 'Venous Whole Blood (Heparinized)',
    doctorName: 'Dr. A. Sharma (Cardiology)',
    facility: 'AIIMS OPD Terminal-2',
    priority: 'STAT',
    isOverdue: true,
    status: 'Pending',
    orderedAt: '11:05 AM',
    doctorNotes: 'Acute chest pain evaluation. Run STAT Trop-I immediately and notify Cardiology OPD.',
  },
  {
    id: 'LAB-ORD-9022',
    patientName: 'Priya Sharma',
    healthId: 'AB-4412-9031-1189',
    testName: 'HbA1c & Fasting Plasma Glucose',
    specimen: 'Fluoride Oxalate & EDTA Blood',
    doctorName: 'Dr. V. Rao (Endocrinology)',
    facility: 'Central OPD',
    priority: 'Urgent',
    isOverdue: false,
    status: 'In Progress',
    orderedAt: '10:15 AM',
    doctorNotes: 'Fasting 10h verified. Check HbA1c for quarterly statin/glycemic titration.',
  },
  {
    id: 'LAB-ORD-9021',
    patientName: 'Rajesh Kumar',
    healthId: 'AB-9823-4011-9022',
    testName: 'Complete Lipid Profile (Full Spectrum)',
    specimen: 'Serum (SST Tube)',
    doctorName: 'Dr. A. Sharma (Cardiology)',
    facility: 'AIIMS OPD-4',
    priority: 'Routine',
    isOverdue: false,
    status: 'Pending',
    orderedAt: '09:30 AM',
    doctorNotes: 'Routine lipid screening prior to antiplatelet regimen evaluation.',
  },
  {
    id: 'LAB-ORD-9019',
    patientName: 'Sanjay Verma',
    healthId: 'AB-1092-8821-4401',
    testName: 'Serum Creatinine & Blood Urea Nitrogen',
    specimen: 'Serum (Red Top)',
    doctorName: 'Dr. R. Gupta (Nephrology)',
    facility: 'Nephrology OPD',
    priority: 'Routine',
    isOverdue: false,
    status: 'In Progress',
    orderedAt: '08:45 AM',
    doctorNotes: 'Baseline renal function check prior to contrast CT imaging.',
  },
  {
    id: 'LAB-ORD-9015',
    patientName: 'Meena Devi',
    healthId: 'AB-3301-4491-0022',
    testName: 'Complete Blood Count (CBC) + ESR',
    specimen: 'EDTA Whole Blood',
    doctorName: 'Dr. K. Patel (General OPD)',
    facility: 'OPD Terminal-1',
    priority: 'Routine',
    isOverdue: false,
    status: 'Completed',
    orderedAt: '08:10 AM',
    doctorNotes: 'Fever evaluation.',
  },
];

const INITIAL_REPORT_HISTORY = [
  {
    id: 'REP-8801',
    patientName: 'Meena Devi',
    healthId: 'AB-3301-4491-0022',
    testName: 'Complete Blood Count (CBC) + ESR',
    doctorName: 'Dr. K. Patel',
    completedAt: 'Today, 11:20 AM',
    fileName: 'CBC_Report_MeenaDevi_8801.pdf',
  },
  {
    id: 'REP-8794',
    patientName: 'Vikram Singh',
    healthId: 'AB-6612-0091-8842',
    testName: 'Thyroid Function Test (T3, T4, TSH)',
    doctorName: 'Dr. V. Rao',
    completedAt: 'Yesterday, 04:45 PM',
    fileName: 'Thyroid_Profile_Vikram_8794.pdf',
  },
  {
    id: 'REP-8790',
    patientName: 'Sunita Roy',
    healthId: 'AB-9921-3310-7711',
    testName: 'Liver Function Test (LFT)',
    doctorName: 'Dr. A. Sharma',
    completedAt: 'Yesterday, 02:15 PM',
    fileName: 'LFT_Report_Sunita_8790.pdf',
  },
];

export default function LabDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState(INITIAL_LAB_ORDERS);
  const [reportHistory, setReportHistory] = useState(INITIAL_REPORT_HISTORY);
  
  // Selection and modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [uploadTargetOrder, setUploadTargetOrder] = useState(null);
  const [showUploadPanel, setShowUploadPanel] = useState(false);

  // Overdue / Urgent orders filtering
  const overdueOrders = orders.filter(o => (o.isOverdue || o.priority === 'STAT') && o.status !== 'Completed');

  // Compute status summary counts
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const inProgressCount = orders.filter(o => o.status === 'In Progress').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;
  const statCount = overdueOrders.length;

  // Handle status toggle morph
  const handleStatusChange = (orderId, newStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  // Handle report upload completion
  const handleUploadSuccess = (orderId, fileName) => {
    const target = orders.find(o => o.id === orderId);
    if (!target) return;

    // Update order status to Completed (#0F6E5C)
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Completed', isOverdue: false } : o));

    // Append to report history log
    const newHistory = {
      id: `REP-${Math.floor(8800 + Math.random() * 100)}`,
      patientName: target.patientName,
      healthId: target.healthId,
      testName: target.testName,
      doctorName: target.doctorName,
      completedAt: 'Just Now',
      fileName: fileName || `${target.testName.replace(/\s+/g, '_')}_${target.id}.pdf`,
    };

    setReportHistory([newHistory, ...reportHistory]);
  };

  return (
    <LabLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      
      {/* 1. QUICK-GLANCE SUMMARY STRIP AT VERY TOP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* PENDING ORDERS STAT CARD */}
        <div className="bg-white p-4 rounded-xl border border-[#E7F3EF] shadow-sm flex items-center justify-between">
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
        <div className="bg-white p-4 rounded-xl border border-[#E7F3EF] shadow-sm flex items-center justify-between">
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

        {/* COMPLETED TODAY (DEEP TEAL NOD BACK TO DOCTOR SIDE) */}
        <div className="bg-white p-4 rounded-xl border border-[#E7F3EF] shadow-sm flex items-center justify-between">
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

        {/* STAT / OVERDUE STAT CARD (MUTED CLAY ACCENT) */}
        <div className="bg-white p-4 rounded-xl border border-[#E7F3EF] shadow-sm flex items-center justify-between">
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

      {/* 2. OVERDUE / STAT ORDER ALERT INDICATOR (MUTED CLAY ACCENT SLIDE-IN) */}
      <OverdueOrderAlert
        overdueOrders={overdueOrders}
        onSelectOrder={(ord) => setSelectedOrder(ord)}
      />

      {/* 3. INCOMING ORDERS QUEUE (PRIMARY VIEW TABLE) */}
      <IncomingOrdersQueue
        orders={orders}
        onSelectOrder={(ord) => setSelectedOrder(ord)}
        onStatusChange={handleStatusChange}
        onUploadReport={(ord) => {
          setUploadTargetOrder(ord);
          setShowUploadPanel(true);
        }}
      />

      {/* 4. REPORT UPLOAD PANEL */}
      {(showUploadPanel || activeTab === 'report-upload') && (
        <ReportUploadPanel
          targetOrder={uploadTargetOrder}
          orders={orders}
          onUploadSuccess={handleUploadSuccess}
          onClose={() => setShowUploadPanel(false)}
        />
      )}

      {/* 5. REPORT HISTORY TABLE */}
      <ReportHistoryTable reports={reportHistory} />

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

    </LabLayout>
  );
}
