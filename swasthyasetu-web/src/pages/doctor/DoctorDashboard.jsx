import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDoctor } from '../../context/DoctorContext';
import AIDrugAlertCard from '../../components/doctor/AIDrugAlertCard';

/**
 * DoctorDashboard — High-level clinical overview for Doctor Workstation.
 * Renders key stats, active patient overview, AI safety status, and quick lab order telemetry.
 */
export default function DoctorDashboard() {
  const navigate = useNavigate();
  const {
    selectedPatient,
    aiAlert,
    labOrders,
    handleApplyAlternativeDrug,
  } = useDoctor();

  const pendingLabCount = labOrders.filter(o => o.status !== 'Report Ready').length;
  const readyLabCount = labOrders.filter(o => o.status === 'Report Ready').length;

  return (
    <div className="space-y-6">
      
      {/* WORKSTATION QUICK STATS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E7F3EF] shadow-sm flex items-center justify-between">
          <div>
            <span className="font-mono text-xs sm:text-sm text-[#1C2B2A]/60 block uppercase font-semibold">Active OPD Queue</span>
            <span className="font-display text-2xl sm:text-3xl font-bold text-[#0F6E5C]">14 Queued</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#E7F3EF] text-[#0F6E5C] flex items-center justify-center font-bold text-sm font-mono">
            OPD
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7F3EF] shadow-sm flex items-center justify-between">
          <div>
            <span className="font-mono text-xs sm:text-sm text-[#1C2B2A]/60 block uppercase font-semibold">Pending Lab Reports</span>
            <span className="font-display text-2xl sm:text-3xl font-bold text-[#3B7A9E]">{labOrders.length} Orders</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#3B7A9E]/15 text-[#3B7A9E] flex items-center justify-center font-bold text-sm font-mono">
            LAB
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7F3EF] shadow-sm flex items-center justify-between">
          <div>
            <span className="font-mono text-xs sm:text-sm text-[#1C2B2A]/60 block uppercase font-semibold">AI Drug Safety</span>
            <span className="font-display text-2xl sm:text-3xl font-bold text-[#C9754A]">
              {aiAlert ? '1 Flagged' : 'Active (0 Warnings)'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#C9754A]/15 text-[#C9754A] flex items-center justify-center font-bold text-sm font-mono">
            AI
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7F3EF] shadow-sm flex items-center justify-between">
          <div>
            <span className="font-mono text-xs sm:text-sm text-[#1C2B2A]/60 block uppercase font-semibold">ABDM Sync Status</span>
            <span className="font-display text-2xl sm:text-3xl font-bold text-[#0F6E5C]">Verified</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#E7F3EF] text-[#0F6E5C] flex items-center justify-center font-bold text-sm font-mono">
            ABHA
          </div>
        </div>
      </div>

      {/* AI DRUG ALERT CARD (IF ACTIVE COLLISION) */}
      {aiAlert && (
        <AIDrugAlertCard
          alertData={aiAlert}
          onAcknowledge={() => {}}
          onApplyAlternative={handleApplyAlternativeDrug}
        />
      )}

      {/* ACTIVE SELECTED PATIENT SUMMARY BANNER */}
      {selectedPatient && (
        <div className="bg-white border border-[#E7F3EF] rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C2B2A]/10 pb-4">
            <div>
              <span className="font-mono text-xs text-[#0F6E5C] uppercase font-bold tracking-wider block">
                ACTIVE PATIENT IN CONSULTATION ROOM:
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1C2B2A] mt-0.5">
                {selectedPatient.name}
              </h2>
              <p className="text-sm font-mono text-[#1C2B2A]/70 mt-1">
                ABHA ID: <span className="text-[#0F6E5C] font-semibold">{selectedPatient.healthId}</span> • {selectedPatient.gender}, {selectedPatient.age} yrs • Blood: {selectedPatient.bloodGroup}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/doctor/consultations')}
                className="px-4 py-2.5 bg-[#0F6E5C] hover:bg-[#0c594a] text-white font-display font-semibold text-sm rounded-lg transition-all duration-150 active:scale-98 focus:outline-none focus:ring-2 focus:ring-[#0F6E5C] flex items-center gap-2"
              >
                <span>Start Consultation</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/doctor/patients')}
                className="px-4 py-2.5 bg-[#E7F3EF] hover:bg-[#0F6E5C] hover:text-white text-[#0F6E5C] font-mono text-sm font-semibold rounded-lg transition-all duration-150 active:scale-98 border border-[#0F6E5C]/20"
              >
                View Full E-Record
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F7F6F3] p-3.5 rounded-xl border border-[#1C2B2A]/10 text-center font-mono text-sm">
            <div>
              <span className="text-xs text-[#1C2B2A]/60 block uppercase font-semibold">BP Vitals</span>
              <span className="font-bold text-[#1C2B2A]">{selectedPatient.vitals?.bp || '120/80'}</span>
            </div>
            <div>
              <span className="text-xs text-[#1C2B2A]/60 block uppercase font-semibold">Heart Rate</span>
              <span className="font-bold text-[#0F6E5C]">{selectedPatient.vitals?.hr || '72 bpm'}</span>
            </div>
            <div>
              <span className="text-xs text-[#1C2B2A]/60 block uppercase font-semibold">SpO2 Level</span>
              <span className="font-bold text-[#1C2B2A]">{selectedPatient.vitals?.spo2 || '98%'}</span>
            </div>
            <div>
              <span className="text-xs text-[#1C2B2A]/60 block uppercase font-semibold">Body Temp</span>
              <span className="font-bold text-[#1C2B2A]">{selectedPatient.vitals?.temp || '98.4°F'}</span>
            </div>
          </div>
        </div>
      )}

      {/* QUICK LAB TELEMETRY CARD */}
      <div className="bg-white border border-[#E7F3EF] rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#1C2B2A]/10 pb-3">
          <div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-[#1C2B2A]">
              Recent Lab Orders &amp; Results Telemetry
            </h3>
            <p className="text-sm text-[#1C2B2A]/70">
              {readyLabCount} reports ready for clinical review • {pendingLabCount} pending dispatch
            </p>
          </div>

          <Link
            to="/doctor/lab-orders"
            className="text-sm font-mono text-[#3B7A9E] hover:underline font-semibold"
          >
            Open Lab Panel →
          </Link>
        </div>

        <div className="space-y-2.5">
          {labOrders.slice(0, 3).map((ord) => (
            <div
              key={ord.id}
              className="p-3.5 bg-[#F7F6F3] border border-[#1C2B2A]/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm font-mono"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-[#1C2B2A]">{ord.id}</span>
                <span className="text-[#1C2B2A]/30">|</span>
                <span className="text-[#3B7A9E] font-semibold">{ord.testName}</span>
                <span className="text-[#1C2B2A]/30">|</span>
                <span className="text-[#1C2B2A]/70 font-sans">{ord.patientName}</span>
              </div>

              <span className={`px-3 py-1 rounded-md text-xs font-semibold self-start sm:self-auto ${
                ord.status === 'Report Ready'
                  ? 'bg-[#0F6E5C] text-white'
                  : ord.status === 'In Progress'
                  ? 'bg-[#3B7A9E] text-white'
                  : 'bg-white text-[#1C2B2A] border border-[#1C2B2A]/20'
              }`}>
                {ord.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
