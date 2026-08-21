import React, { useState } from 'react';
import doctorService from '../../services/doctorService';

/**
 * LabOrderPanel — Lab order dispatch & live order status tracker for Doctor Workstation.
 * Features test selection, lab facility picker, priority tagging, and live status chip morphing
 * over 250ms using Signal Blue (#3B7A9E) for in-progress and Deep Teal (#0F6E5C) for completed reports.
 */
export default function LabOrderPanel({ patient, orders = [], onOrderSubmit, onStatusChange, onRefresh }) {
  const [selectedTest, setSelectedTest] = useState('Lipid Profile (Full)');
  const [selectedFacility, setSelectedFacility] = useState('Central NABL Diagnostic Hub (LAB-3021)');
  const [priority, setPriority] = useState('Routine');
  const [notes, setNotes] = useState('');

  // Report viewing modal states
  const [viewingReportModal, setViewingReportModal] = useState(false);
  const [activeReportOrder, setActiveReportOrder] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState(null);

  const handleViewReport = async (order) => {
    setActiveReportOrder(order);
    setViewingReportModal(true);
    setLoadingReport(true);
    setReportError(null);
    setReportData(null);

    try {
      const data = await doctorService.getLabReportByOrderId(order.id);
      if (data) {
        setReportData(data);
      } else {
        setReportError('Report record not found.');
      }
    } catch (err) {
      console.warn('Failed to load lab report:', err.message);
      setReportError(err.message || 'Unable to fetch report details.');
    } finally {
      setLoadingReport(false);
    }
  };

  const commonTests = [
    'Lipid Profile (Full)',
    'HbA1c & Fasting Glucose',
    'Complete Blood Count (CBC)',
    'Serum Creatinine & Electrolytes',
    'Liver Function Test (LFT)',
    'Thyroid Profile (T3, T4, TSH)',
    '12-Lead ECG & Trop-I',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTest) return;

    const newOrder = {
      id: `LAB-ORD-${Date.now().toString().slice(-4)}`,
      patientName: patient?.name || 'Rajesh Kumar',
      healthId: patient?.healthId || 'AB-9823-4011-9022',
      testName: selectedTest,
      facility: selectedFacility,
      priority,
      status: 'Pending', // 'Pending' | 'In Progress' | 'Report Ready'
      orderedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (onOrderSubmit) {
      onOrderSubmit(newOrder);
    }
  };

  return (
    <div className="bg-white border border-[#E7F3EF] rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
      
      {/* PANEL HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1C2B2A]/10 pb-4 gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#1C2B2A] flex items-center gap-2">
            <svg className="w-6 h-6 text-[#3B7A9E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.605 15.13a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Diagnostic Lab Orders Panel
          </h2>
          <p className="text-sm text-[#1C2B2A]/70 mt-1">
            Order blood work, pathology, imaging tests &amp; receive real-time report telemetry.
          </p>
        </div>

        <span className="font-mono text-xs sm:text-sm text-[#3B7A9E] bg-[#3B7A9E]/10 border border-[#3B7A9E]/20 px-3 py-1.5 rounded-lg font-semibold self-start sm:self-auto">
          SIGNAL BLUE LAB HUB
        </span>
      </div>

      {/* NEW LAB ORDER DISPATCH FORM */}
      <form onSubmit={handleSubmit} className="bg-[#F7F6F3] p-4.5 rounded-xl border border-[#1C2B2A]/10 space-y-4">
        <span className="font-mono text-xs sm:text-sm font-semibold text-[#1C2B2A] uppercase tracking-wider block">
          Dispatch New Lab Order:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* TEST SELECTION */}
          <div>
            <label htmlFor="lab-test-select" className="block text-xs sm:text-sm font-mono font-semibold uppercase text-[#1C2B2A] mb-1.5">
              Select Investigation / Test
            </label>
            <select
              id="lab-test-select"
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#1C2B2A]/20 rounded-lg text-sm font-mono text-[#1C2B2A] focus:outline-none focus:border-[#3B7A9E] focus:ring-2 focus:ring-[#E7F3EF]"
            >
              {commonTests.map((t, idx) => (
                <option key={idx} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* LAB FACILITY SELECTOR */}
          <div>
            <label htmlFor="lab-facility-select" className="block text-xs sm:text-sm font-mono font-semibold uppercase text-[#1C2B2A] mb-1.5">
              Target Laboratory Facility
            </label>
            <select
              id="lab-facility-select"
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#1C2B2A]/20 rounded-lg text-sm font-mono text-[#1C2B2A] focus:outline-none focus:border-[#3B7A9E] focus:ring-2 focus:ring-[#E7F3EF]"
            >
              <option value="Central NABL Diagnostic Hub (LAB-3021)">Central NABL Diagnostic Hub (LAB-3021)</option>
              <option value="Metropolis Pathology Lab (LAB-1092)">Metropolis Pathology Lab (LAB-1092)</option>
              <option value="AIIMS OPD Lab Terminal-2">AIIMS OPD Lab Terminal-2</option>
            </select>
          </div>

          {/* PRIORITY SELECTION */}
          <div>
            <label htmlFor="lab-priority-select" className="block text-xs sm:text-sm font-mono font-semibold uppercase text-[#1C2B2A] mb-1.5">
              Clinical Priority Tag
            </label>
            <div className="flex gap-2">
              {['Routine', 'Urgent', 'STAT'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 px-3 font-mono text-xs sm:text-sm rounded-lg transition-all border ${
                    priority === p
                      ? p === 'STAT'
                        ? 'bg-[#C9754A] text-white border-[#C9754A] font-bold shadow-xs'
                        : 'bg-[#3B7A9E] text-white border-[#3B7A9E] font-bold shadow-xs'
                      : 'bg-white text-[#1C2B2A]/80 border-[#1C2B2A]/20 hover:border-[#3B7A9E]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* NOTES / CLINICAL INDICATIONS */}
          <div>
            <label htmlFor="lab-notes" className="block text-xs sm:text-sm font-mono font-semibold uppercase text-[#1C2B2A] mb-1.5">
              Clinical Indications / Remarks
            </label>
            <input
              id="lab-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Fasting sample required, check for statin titration"
              className="w-full px-3.5 py-2 bg-white border border-[#1C2B2A]/20 rounded-lg text-sm text-[#1C2B2A] focus:outline-none focus:border-[#3B7A9E]"
            />
          </div>

        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="py-2.5 px-5 bg-[#3B7A9E] hover:bg-[#316583] text-white font-mono text-xs sm:text-sm font-semibold rounded-lg transition-all duration-150 active:scale-98 focus:outline-none focus:ring-2 focus:ring-[#3B7A9E] flex items-center gap-2"
          >
            <span>Transmit Lab Order</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </form>

      {/* LIVE LAB ORDERS LIST WITH SMOOTH COLOR MORPHING STATUS CHIPS (250ms transition) */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="font-display font-bold text-base sm:text-lg text-[#1C2B2A]">
            Active Lab Orders Telemetry
          </h3>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="px-2.5 py-1 bg-[#E7F3EF] hover:bg-[#0F6E5C] hover:text-white text-[#0F6E5C] font-mono text-xs font-semibold rounded border border-[#0F6E5C]/20 transition-all active:scale-98"
              >
                ↻ Refresh Status
              </button>
            )}
            <span className="font-mono text-xs text-[#1C2B2A]/50">
              Live status telemetry
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {orders.map((ord) => {
            let chipStyle = 'bg-[#F7F6F3] text-[#1C2B2A] border-[#1C2B2A]/20';
            const isCompleted = ord.status === 'Report Ready' || ord.status === 'completed';

            if (ord.status === 'In Progress' || ord.status === 'in_progress') {
              chipStyle = 'bg-[#3B7A9E] text-white border-[#3B7A9E] font-bold shadow-xs';
            } else if (isCompleted) {
              chipStyle = 'bg-[#0F6E5C] text-white border-[#0F6E5C] font-bold shadow-xs';
            }

            return (
              <div
                key={ord.id}
                className="p-4 bg-white border border-[#1C2B2A]/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#3B7A9E]/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
                    <span className="font-bold text-[#1C2B2A]">{ord.id}</span>
                    <span className="text-[#1C2B2A]/30">|</span>
                    <span className="text-[#3B7A9E] font-semibold">{ord.testName || ord.test_names || ord.test_name}</span>
                    <span className="text-[#1C2B2A]/30">|</span>
                    <span className="text-[#1C2B2A]/60">{ord.orderedAt || ord.ordered_at}</span>
                  </div>

                  <div className="text-sm text-[#1C2B2A]/70 flex items-center gap-2">
                    <span>Patient: <strong>{ord.patientName || ord.patient_name || 'Patient'}</strong></span>
                    {(ord.healthId || ord.patient_health_id) && (
                      <span className="font-mono text-xs text-[#0F6E5C]">({ord.healthId || ord.patient_health_id})</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {/* VIEW REPORT BUTTON FOR COMPLETED ORDERS */}
                  {isCompleted && (
                    <button
                      type="button"
                      onClick={() => handleViewReport(ord)}
                      className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-mono bg-[#0F6E5C] hover:bg-[#0B5244] text-white font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>View Report</span>
                    </button>
                  )}

                  {/* INTERACTIVE STATUS CHIP */}
                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onStatusChange) {
                          const nextStatus = ord.status === 'Pending' ? 'In Progress' : ord.status === 'In Progress' ? 'Report Ready' : 'Pending';
                          onStatusChange(ord.id, nextStatus);
                        }
                      }}
                      title="Click to toggle status"
                      className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-mono border transition-colors duration-200 ease-out cursor-pointer active:scale-98 flex items-center gap-2 ${chipStyle}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        ord.status === 'Pending' ? 'bg-[#1C2B2A]/40' : 'bg-white animate-pulse'
                      }`} />
                      <span>{ord.status}</span>
                      <span className="text-xs opacity-60">↻</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* VIEW REPORT MODAL */}
      {viewingReportModal && (
        <div className="fixed inset-0 bg-[#1C2B2A]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#E7F3EF] shadow-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#1C2B2A]/10 pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-[#1C2B2A]">
                  Diagnostic Lab Report
                </h3>
                <p className="text-xs font-mono text-[#0F6E5C] mt-0.5">
                  Order ID: {activeReportOrder?.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingReportModal(false)}
                className="text-[#1C2B2A]/40 hover:text-[#1C2B2A] text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {loadingReport ? (
              <div className="py-8 text-center font-mono text-sm text-[#1C2B2A]/60">
                Resolving report file &amp; generating signed URL...
              </div>
            ) : reportError ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs font-mono text-amber-800 space-y-2">
                <p>⚠️ {reportError}</p>
                <p className="text-[#1C2B2A]/70">The report file is processing or was completed in offline demo mode.</p>
              </div>
            ) : reportData ? (
              <div className="space-y-4">
                <div className="bg-[#F7F6F3] p-4 rounded-xl space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#1C2B2A]/60 font-mono text-xs">Test Name:</span>
                    <span className="font-bold text-[#1C2B2A]">{activeReportOrder?.testName || activeReportOrder?.test_names}</span>
                  </div>
                  {reportData.uploaded_at && (
                    <div className="flex justify-between">
                      <span className="text-[#1C2B2A]/60 font-mono text-xs">Uploaded At:</span>
                      <span className="font-mono text-xs text-[#1C2B2A]">{new Date(reportData.uploaded_at).toLocaleString()}</span>
                    </div>
                  )}
                  {reportData.report_summary && (
                    <div className="pt-2 border-t border-[#1C2B2A]/10">
                      <span className="text-[#1C2B2A]/60 font-mono text-xs block mb-1">Report Summary / Observations:</span>
                      <p className="text-xs text-[#1C2B2A]/90 bg-white p-2.5 rounded-lg border border-[#1C2B2A]/10">
                        {reportData.report_summary}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {reportData.report_file_url && (
                    <a
                      href={reportData.report_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-4 bg-[#0F6E5C] hover:bg-[#0B5244] text-white font-mono text-xs font-semibold rounded-xl text-center transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Open / Download PDF
                    </a>
                  )}

                  {reportData.share_url && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(reportData.share_url);
                        alert('Public report link copied to clipboard!');
                      }}
                      className="py-2.5 px-4 bg-[#F7F6F3] hover:bg-[#E7F3EF] text-[#1C2B2A] border border-[#1C2B2A]/20 font-mono text-xs font-semibold rounded-xl transition-all"
                    >
                      Copy Share Link
                    </button>
                  )}
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingReportModal(false)}
                className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-[#1C2B2A] text-xs font-mono rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
