import React, { useState } from 'react';

/**
 * LabOrderPanel — Lab order dispatch & live order status tracker for Doctor Workstation.
 * Features test selection, lab facility picker, priority tagging, and live status chip morphing
 * over 250ms using Signal Blue (#3B7A9E) for in-progress and Deep Teal (#0F6E5C) for completed reports.
 */
export default function LabOrderPanel({ patient, orders = [], onOrderSubmit, onStatusChange }) {
  const [selectedTest, setSelectedTest] = useState('Lipid Profile (Full)');
  const [selectedFacility, setSelectedFacility] = useState('Central NABL Diagnostic Hub (LAB-3021)');
  const [priority, setPriority] = useState('Routine');
  const [notes, setNotes] = useState('');

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
          <span className="font-mono text-xs text-[#1C2B2A]/50">
            Click status chip to simulate live lab morph
          </span>
        </div>

        <div className="space-y-2.5">
          {orders.map((ord) => {
            let chipStyle = 'bg-[#F7F6F3] text-[#1C2B2A] border-[#1C2B2A]/20';
            if (ord.status === 'In Progress') {
              chipStyle = 'bg-[#3B7A9E] text-white border-[#3B7A9E] font-bold shadow-xs';
            } else if (ord.status === 'Report Ready') {
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
                    <span className="text-[#3B7A9E] font-semibold">{ord.testName}</span>
                    <span className="text-[#1C2B2A]/30">|</span>
                    <span className="text-[#1C2B2A]/60">{ord.orderedAt}</span>
                  </div>

                  <div className="text-sm text-[#1C2B2A]/70 flex items-center gap-2">
                    <span>Patient: <strong>{ord.patientName}</strong></span>
                    <span className="font-mono text-xs text-[#0F6E5C]">({ord.healthId})</span>
                  </div>
                </div>

                {/* INTERACTIVE SMOOTH MORPHING STATUS CHIP (250ms color transition) */}
                <button
                  type="button"
                  onClick={() => {
                    if (onStatusChange) {
                      const nextStatus = ord.status === 'Pending' ? 'In Progress' : ord.status === 'In Progress' ? 'Report Ready' : 'Pending';
                      onStatusChange(ord.id, nextStatus);
                    }
                  }}
                  title="Click to toggle status morph"
                  className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-mono border transition-colors duration-200 ease-out cursor-pointer active:scale-98 flex items-center gap-2 self-start sm:self-auto ${chipStyle}`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    ord.status === 'Pending' ? 'bg-[#1C2B2A]/40' : 'bg-white animate-pulse'
                  }`} />
                  <span>{ord.status}</span>
                  <span className="text-xs opacity-60">↻</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
