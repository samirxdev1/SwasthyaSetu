import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import labService from '../services/labService';
import { useAuth } from './AuthContext';

const LabContext = createContext(null);

/**
 * Calculates if order is overdue (older than 24 hours since ordered_at)
 */
const checkIsOverdue = (orderedAtStr) => {
  if (!orderedAtStr) return false;
  const orderedTime = new Date(orderedAtStr).getTime();
  if (isNaN(orderedTime)) return false;
  const diffHours = (Date.now() - orderedTime) / (1000 * 60 * 60);
  return diffHours >= 24;
};

/**
 * Formats ordered_at date string into human readable time/date
 */
const formatOrderedAt = (orderedAtStr) => {
  if (!orderedAtStr) return 'Recently';
  const d = new Date(orderedAtStr);
  if (isNaN(d.getTime())) return orderedAtStr;

  const isToday = new Date().toDateString() === d.toDateString();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

/**
 * Normalizes backend lab order object into standard UI format
 */
const formatOrderForUI = (raw, isUnassigned = false) => {
  const isOverdue = checkIsOverdue(raw.ordered_at);

  let statusLabel = 'Pending';
  if (raw.status === 'in_progress') {
    statusLabel = 'In Progress';
  } else if (raw.status === 'completed' || raw.status === 'Report Ready') {
    statusLabel = 'Completed';
  }

  return {
    id: raw.id,
    consultationId: raw.consultation_id,
    patientId: raw.patient_id,
    doctorId: raw.doctor_id,
    laboratoryId: raw.laboratory_id,
    patientName: raw.patient_name || raw.patientName || (raw.patient_id ? `Patient (${raw.patient_id.slice(0, 8)})` : 'Patient'),
    healthId: raw.patient_health_id || raw.healthId || (raw.patient_id ? `ABDM-${raw.patient_id.slice(0, 8)}` : 'ABDM-HEALTH-ID'),
    testName: raw.test_name || 'Laboratory Test',
    specimen: raw.specimen || 'Diagnostic Sample (Blood/Serum)',
    doctorName: raw.doctor_name || raw.doctorName || (raw.doctor_id ? `Dr. (ID: ${raw.doctor_id.slice(0, 6)})` : 'Attending Physician'),
    facility: raw.facility || 'SwasthyaSetu OPD',
    priority: raw.priority || (isOverdue ? 'STAT' : 'Routine'),
    isOverdue,
    status: statusLabel,
    rawStatus: raw.status,
    orderedAt: formatOrderedAt(raw.ordered_at),
    rawOrderedAt: raw.ordered_at,
    isUnassigned: isUnassigned || !raw.laboratory_id,
    doctorNotes: raw.doctor_notes || 'Diagnostic investigation dispatched from OPD.',
    raw,
  };
};

export function LabProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState([]);
  const [reportHistory, setReportHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toast / feedback message state
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // Fetch lab orders & queues
  const fetchOrdersAndQueues = useCallback(async () => {
    if (!isAuthenticated || (user && user.role !== 'laboratory')) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch both pending unassigned orders and lab's assigned queue in parallel
      const [pendingRes, myQueueRes] = await Promise.allSettled([
        labService.getPendingLabOrders(),
        labService.getMyLabOrderQueue(),
      ]);

      const pendingRaw = pendingRes.status === 'fulfilled' ? pendingRes.value || [] : [];
      const myQueueRaw = myQueueRes.status === 'fulfilled' ? myQueueRes.value || [] : [];

      // Map pending unassigned orders
      const pendingFormatted = pendingRaw.map(o => formatOrderForUI(o, true));

      // Map assigned queue orders (in_progress or completed)
      const myQueueFormatted = myQueueRaw.map(o => formatOrderForUI(o, false));

      // Avoid duplicates if any order appears in both lists
      const myQueueIds = new Set(myQueueFormatted.map(o => o.id));
      const filteredPending = pendingFormatted.filter(o => !myQueueIds.has(o.id));

      const combinedOrders = [...myQueueFormatted, ...filteredPending];
      setOrders(combinedOrders);

      // Extract completed orders for report history
      const completedOrders = myQueueFormatted.filter(o => o.status === 'Completed');

      // Fetch report details for completed orders to get report_file_url
      const historyList = await Promise.all(
        completedOrders.map(async (ord) => {
          let fileUrl = null;
          let fileName = null;
          let summary = null;

          try {
            const reportData = await labService.getLabReportByOrderId(ord.id);
            if (reportData) {
              fileUrl = reportData.report_file_url;
              summary = reportData.report_summary;
              if (fileUrl) {
                const parts = fileUrl.split('/');
                fileName = parts[parts.length - 1];
              }
            }
          } catch (e) {
            // Ignore individual report fetch error
          }

          return {
            id: `REP-${ord.id.slice(0, 8)}`,
            labOrderId: ord.id,
            patientName: ord.patientName,
            healthId: ord.healthId,
            testName: ord.testName,
            doctorName: ord.doctorName,
            completedAt: ord.orderedAt,
            fileName: fileName || `${ord.testName.replace(/\s+/g, '_')}_Report.pdf`,
            fileUrl: fileUrl,
            reportSummary: summary,
          };
        })
      );

      setReportHistory(historyList);
    } catch (err) {
      console.error('Error fetching lab queues:', err);
      setError(err.message || 'Failed to fetch lab orders queue');
      showFeedback('error', err.message || 'Failed to sync lab orders with server');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchOrdersAndQueues();
  }, [fetchOrdersAndQueues]);

  /**
   * Handle accepting an unassigned pending lab order
   */
  const handleAcceptOrder = async (orderId) => {
    try {
      const updatedRaw = await labService.acceptLabOrder(orderId);
      const updatedOrder = formatOrderForUI(updatedRaw, false);

      // Optimistically update order in local state to "In Progress"
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...updatedOrder, status: 'In Progress', isUnassigned: false } : o))
      );

      showFeedback('success', `Lab order ${orderId.slice(0, 8)} accepted successfully!`);

      // Refresh queues to confirm server sync
      fetchOrdersAndQueues();
      return true;
    } catch (err) {
      console.error('Accept order error:', err);
      showFeedback('error', err.message || 'Failed to accept order. It may have been assigned to another lab.');
      // Refresh pending list on 409 conflict error so invalid order is removed
      fetchOrdersAndQueues();
      return false;
    }
  };

  /**
   * Handle uploading a lab report file for an order
   */
  const handleUploadReport = async (orderId, file, reportSummary = '') => {
    if (!file || !orderId) {
      showFeedback('error', 'Please select a valid lab order and file to upload.');
      return false;
    }

    try {
      const formData = new FormData();
      formData.append('lab_order_id', orderId);
      formData.append('file', file);
      if (reportSummary.trim()) {
        formData.append('report_summary', reportSummary.trim());
      } else {
        formData.append('report_summary', 'Diagnostic report uploaded by laboratory workstation.');
      }

      const reportResult = await labService.uploadLabReport(formData);

      // Optimistically update order status in local state to "Completed"
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'Completed', isOverdue: false } : o))
      );

      const targetOrder = orders.find((o) => o.id === orderId);

      // Append newly uploaded report to history log
      const newHistoryItem = {
        id: `REP-${orderId.slice(0, 8)}`,
        labOrderId: orderId,
        patientName: targetOrder?.patientName || 'Patient',
        healthId: targetOrder?.healthId || 'ABDM-ID',
        testName: targetOrder?.testName || 'Diagnostic Report',
        doctorName: targetOrder?.doctorName || 'Doctor',
        completedAt: 'Just Now',
        fileName: file.name,
        fileUrl: reportResult?.report_file_url || null,
        reportSummary: reportSummary || reportResult?.report_summary,
      };

      setReportHistory((prev) => [newHistoryItem, ...prev]);
      showFeedback('success', 'Lab report uploaded successfully! Order marked as Completed.');

      // Refresh queues
      fetchOrdersAndQueues();
      return true;
    } catch (err) {
      console.error('Upload report error:', err);
      showFeedback('error', err.message || 'Failed to upload lab report.');
      return false;
    }
  };

  const value = {
    orders,
    setOrders,
    reportHistory,
    setReportHistory,
    isLoading,
    error,
    feedback,
    showFeedback,
    fetchOrdersAndQueues,
    handleAcceptOrder,
    handleUploadReport,
  };

  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
}

export function useLab() {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error('useLab must be used within a LabProvider');
  }
  return context;
}
