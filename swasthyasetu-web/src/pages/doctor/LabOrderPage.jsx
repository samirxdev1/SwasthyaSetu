import React from 'react';
import { useDoctor } from '../../context/DoctorContext';
import LabOrderPanel from '../../components/doctor/LabOrderPanel';

/**
 * LabOrderPage — Dedicated Diagnostic Lab Orders & Telemetry page.
 * Renders patient context and LabOrderPanel component.
 */
export default function LabOrderPage() {
  const {
    selectedPatient,
    labOrders,
    handleLabOrderSubmit,
    handleLabStatusChange,
  } = useDoctor();

  return (
    <div className="space-y-6">
      
      {/* PATIENT CONTEXT BANNER */}
      {selectedPatient && (
        <div className="bg-white border border-[#E7F3EF] rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#3B7A9E] text-white flex items-center justify-center font-display font-bold text-sm">
              LAB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg sm:text-xl font-bold text-[#1C2B2A]">
                  Diagnostic Lab Dispatch for {selectedPatient.name}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#3B7A9E]/15 text-[#3B7A9E] font-semibold">
                  ABDM Verified
                </span>
              </div>
              <p className="text-xs sm:text-sm font-mono text-[#1C2B2A]/70 mt-0.5">
                ABHA ID: <span className="text-[#0F6E5C] font-semibold">{selectedPatient.healthId}</span> • Age: {selectedPatient.age} yrs • Blood: {selectedPatient.bloodGroup}
              </p>
            </div>
          </div>

          <div className="font-mono text-xs text-[#3B7A9E] bg-[#3B7A9E]/10 border border-[#3B7A9E]/20 px-3 py-1.5 rounded-lg self-start sm:self-auto font-semibold">
            {labOrders.length} Total Orders Recorded
          </div>
        </div>
      )}

      {/* DIAGNOSTIC LAB ORDERS PANEL */}
      <LabOrderPanel
        patient={selectedPatient}
        orders={labOrders}
        onOrderSubmit={handleLabOrderSubmit}
        onStatusChange={handleLabStatusChange}
      />

    </div>
  );
}
