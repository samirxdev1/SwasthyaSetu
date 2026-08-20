import React from 'react';
import { useDoctor } from '../../context/DoctorContext';
import AIDrugAlertCard from '../../components/doctor/AIDrugAlertCard';
import ConsultationForm from '../../components/doctor/ConsultationForm';

/**
 * ConsultationPage — Dedicated Clinical Consultation & E-Prescribing page.
 * Renders active patient header, AI Drug-Interaction Alert card if collision is flagged,
 * and ConsultationForm.
 */
export default function ConsultationPage() {
  const {
    selectedPatient,
    prescribedMeds,
    setPrescribedMeds,
    handleAddPrescription,
    handleSaveConsultation,
    handleConfirmDiagnosis,
    isSavingConsultation,
    activeConsultation,
    aiAlert,
    handleAcknowledgeAlert,
    handleApplyAlternativeDrug,
  } = useDoctor();

  return (
    <div className="space-y-6">
      
      {/* PATIENT CONTEXT BANNER */}
      {selectedPatient ? (
        <div className="bg-white border border-[#E7F3EF] rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0F6E5C] text-white flex items-center justify-center font-display font-bold text-sm">
              {selectedPatient.name ? selectedPatient.name.split(' ').map(n => n[0]).join('') : 'PT'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg sm:text-xl font-bold text-[#1C2B2A]">
                  Consultation for {selectedPatient.name}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#E7F3EF] text-[#0F6E5C] font-semibold">
                  {selectedPatient.gender}, {selectedPatient.age} yrs
                </span>
              </div>
              <p className="text-xs sm:text-sm font-mono text-[#1C2B2A]/70 mt-0.5">
                ABDM Health ID: <span className="text-[#0F6E5C] font-semibold">{selectedPatient.healthId}</span> • Blood: {selectedPatient.bloodGroup}
              </p>
            </div>
          </div>

          <div className="font-mono text-xs text-[#1C2B2A]/60 bg-[#F7F6F3] px-3 py-1.5 rounded-lg border border-[#1C2B2A]/10 self-start sm:self-auto">
            Vitals: {selectedPatient.vitals?.bp || '120/80'} | {selectedPatient.vitals?.hr || '72 bpm'}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-[#F7F6F3] border border-[#1C2B2A]/10 rounded-xl text-sm text-[#1C2B2A]/70">
          No patient selected. Please use Patient Search to select a patient.
        </div>
      )}

      {/* AI DRUG-INTERACTION ALERT CARD */}
      {aiAlert && (
        <AIDrugAlertCard
          alertData={aiAlert}
          onAcknowledge={handleAcknowledgeAlert}
          onApplyAlternative={handleApplyAlternativeDrug}
        />
      )}

      {/* ACTIVE CONSULTATION FORM */}
      <ConsultationForm
        patient={selectedPatient}
        prescribedMeds={prescribedMeds}
        setPrescribedMeds={setPrescribedMeds}
        onSaveConsultation={handleSaveConsultation}
        onAddPrescription={handleAddPrescription}
        onConfirmDiagnosis={handleConfirmDiagnosis}
        activeConsultation={activeConsultation}
        isSaving={isSavingConsultation}
      />

    </div>
  );
}
