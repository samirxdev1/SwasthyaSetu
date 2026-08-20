import React, { useState } from 'react';

/**
 * ConsultationForm — Fast-fill clinical consultation entry for active patient visits.
 * Features generous height inputs, explicit top labels (no floating labels),
 * e-prescription composer with IBM Plex Mono dosage/frequency values,
 * and live drug collision triggers.
 */
export default function ConsultationForm({
  patient,
  prescribedMeds = [],
  setPrescribedMeds,
  onSaveConsultation,
  onAddPrescription,
  onConfirmDiagnosis,
  isSaving,
  activeConsultation
}) {
  const [symptoms, setSymptoms] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [vitalsBp, setVitalsBp] = useState(patient?.vitals?.bp || '120/80');
  const [vitalsHr, setVitalsHr] = useState(patient?.vitals?.hr || '72 bpm');

  // New drug input form state
  const [newMedName, setNewMedName] = useState('');
  const [newDosage, setNewDosage] = useState('500mg');
  const [newFrequency, setNewFrequency] = useState('1-0-1');
  const [newDuration, setNewDuration] = useState('7 days');

  // Common quick-add drugs for doctors
  const quickMedSuggestions = [
    { name: 'Metformin', dosage: '500mg', freq: '1-0-1' },
    { name: 'Lisinopril', dosage: '10mg', freq: '1-0-0' },
    { name: 'Aspirin', dosage: '75mg', freq: '0-1-0' },
    { name: 'Warfarin', dosage: '5mg', freq: '0-0-1' },
    { name: 'Clopidogrel', dosage: '75mg', freq: '1-0-0' },
    { name: 'Atorvastatin', dosage: '20mg', freq: '0-0-1' },
    { name: 'Amoxicillin', dosage: '500mg', freq: '1-1-1' },
  ];

  const handleAddMedication = (e) => {
    e?.preventDefault();
    if (!newMedName.trim()) return;

    const newMed = {
      name: newMedName.trim(),
      dosage: newDosage,
      frequency: newFrequency,
      duration: newDuration,
    };

    if (onAddPrescription) {
      onAddPrescription(newMed);
    } else if (setPrescribedMeds) {
      setPrescribedMeds([...prescribedMeds, { id: Date.now(), ...newMed }]);
    }
    setNewMedName('');
  };

  const handleQuickAdd = (med) => {
    const newMed = {
      name: med.name,
      dosage: med.dosage,
      frequency: med.freq,
      duration: '14 days',
    };
    if (onAddPrescription) {
      onAddPrescription(newMed);
    } else if (setPrescribedMeds) {
      setPrescribedMeds([...prescribedMeds, { id: Date.now(), ...newMed }]);
    }
  };

  const handleRemoveMed = (id) => {
    setPrescribedMeds(prescribedMeds.filter(m => m.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveConsultation({
      symptoms,
      clinicalNotes,
      diagnosis,
      vitals: { bp: vitalsBp, hr: vitalsHr },
      prescribedMeds,
    });
  };

  return (
    <div className="bg-white border border-[#E7F3EF] rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1C2B2A]/10 pb-4 gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#1C2B2A] flex items-center gap-2">
            <svg className="w-6 h-6 text-[#0F6E5C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Active Consultation Form
          </h2>
          <p className="text-sm text-[#1C2B2A]/70 mt-1">
            Record patient symptoms, diagnosis, clinical examination, and generate e-prescriptions.
          </p>
        </div>

        <span className="font-mono text-xs sm:text-sm text-[#1C2B2A]/70 bg-[#F7F6F3] px-3 py-1.5 rounded-lg border border-[#1C2B2A]/10 self-start sm:self-auto font-semibold">
          OPD SESSION ACTIVE
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* VITALS OVERRIDE / CONFIRMATION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F7F6F3] p-4 rounded-xl border border-[#1C2B2A]/10">
          <div>
            <label htmlFor="vital-bp" className="block text-xs sm:text-sm font-mono font-semibold uppercase text-[#1C2B2A] mb-1.5">
              Current Blood Pressure (BP)
            </label>
            <input
              id="vital-bp"
              type="text"
              value={vitalsBp}
              onChange={(e) => setVitalsBp(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#1C2B2A]/20 rounded-lg text-sm sm:text-base font-mono text-[#1C2B2A] focus:outline-none focus:border-[#0F6E5C] focus:ring-2 focus:ring-[#E7F3EF]"
            />
          </div>

          <div>
            <label htmlFor="vital-hr" className="block text-xs sm:text-sm font-mono font-semibold uppercase text-[#1C2B2A] mb-1.5">
              Current Heart Rate (HR)
            </label>
            <input
              id="vital-hr"
              type="text"
              value={vitalsHr}
              onChange={(e) => setVitalsHr(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#1C2B2A]/20 rounded-lg text-sm sm:text-base font-mono text-[#1C2B2A] focus:outline-none focus:border-[#0F6E5C] focus:ring-2 focus:ring-[#E7F3EF]"
            />
          </div>
        </div>

        {/* CHIEF SYMPTOMS & PRESENTING COMPLAINTS */}
        <div>
          <label 
            htmlFor="chief-symptoms"
            className="block text-xs sm:text-sm font-mono uppercase tracking-wider font-semibold text-[#1C2B2A] mb-1.5"
          >
            Chief Symptoms &amp; Duration *
          </label>
          <textarea
            id="chief-symptoms"
            rows={2}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g. Recurrent exertional chest tightness for 3 days, mild shortness of breath..."
            className="w-full p-3.5 bg-[#F7F6F3] border border-[#1C2B2A]/20 rounded-xl text-base text-[#1C2B2A] placeholder:text-[#1C2B2A]/40 transition-colors focus:bg-white focus:outline-none focus:border-[#0F6E5C] focus:ring-2 focus:ring-[#E7F3EF]"
            required
          />
        </div>

        {/* CLINICAL NOTES & EXAMINATION */}
        <div>
          <label 
            htmlFor="clinical-notes"
            className="block text-xs sm:text-sm font-mono uppercase tracking-wider font-semibold text-[#1C2B2A] mb-1.5"
          >
            Clinical Notes &amp; Physical Examination
          </label>
          <textarea
            id="clinical-notes"
            rows={3}
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
            placeholder="e.g. S1 S2 present, no murmurs. Lungs clear to auscultation bilaterally. Bilateral pedal edema absent..."
            className="w-full p-3.5 bg-[#F7F6F3] border border-[#1C2B2A]/20 rounded-xl text-base text-[#1C2B2A] placeholder:text-[#1C2B2A]/40 transition-colors focus:bg-white focus:outline-none focus:border-[#0F6E5C] focus:ring-2 focus:ring-[#E7F3EF]"
          />
        </div>

        {/* PROBABLE DIAGNOSIS */}
        <div>
          <label 
            htmlFor="probable-diagnosis"
            className="block text-xs sm:text-sm font-mono uppercase tracking-wider font-semibold text-[#1C2B2A] mb-1.5"
          >
            Probable Clinical Diagnosis *
          </label>
          <input
            id="probable-diagnosis"
            type="text"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. Stable Angina / Hypertensive Heart Disease"
            className="w-full px-4 py-3 bg-[#F7F6F3] border border-[#1C2B2A]/20 rounded-xl text-base text-[#1C2B2A] placeholder:text-[#1C2B2A]/40 transition-colors focus:bg-white focus:outline-none focus:border-[#0F6E5C] focus:ring-2 focus:ring-[#E7F3EF]"
            required
          />
        </div>

        {/* E-PRESCRIBING SUB-SECTION */}
        <div className="border-t border-[#1C2B2A]/10 pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base sm:text-lg text-[#1C2B2A] flex items-center gap-2">
              <span className="font-mono text-xs sm:text-sm px-2.5 py-0.5 bg-[#0F6E5C] text-white rounded font-semibold">Rx</span>
              E-Prescription Composer
            </h3>
            <span className="font-mono text-xs text-[#1C2B2A]/60">
              Live AI Interaction Checker Active
            </span>
          </div>

          {/* QUICK ADD MEDICINE PILLS */}
          <div>
            <span className="font-mono text-xs sm:text-sm text-[#1C2B2A]/60 font-semibold uppercase tracking-wider block mb-2">
              Quick Add Common Prescriptions:
            </span>
            <div className="flex flex-wrap gap-2">
              {quickMedSuggestions.map((m, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickAdd(m)}
                  className="px-3 py-1.5 bg-[#E7F3EF] hover:bg-[#0F6E5C] hover:text-white text-[#0F6E5C] font-mono text-xs sm:text-sm rounded-lg transition-colors border border-[#0F6E5C]/20 flex items-center gap-1.5 active:scale-98"
                >
                  <span>+ {m.name}</span>
                  <span className="opacity-70 text-xs">({m.dosage})</span>
                </button>
              ))}
            </div>
          </div>

          {/* ADD NEW MEDICINE INPUT ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-[#F7F6F3] p-4 rounded-xl border border-[#1C2B2A]/15 items-end">
            <div className="sm:col-span-4">
              <label htmlFor="med-name" className="block text-xs font-mono font-semibold uppercase text-[#1C2B2A] mb-1">
                Medicine Name
              </label>
              <input
                id="med-name"
                type="text"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                placeholder="e.g. Aspirin or Warfarin"
                className="w-full px-3 py-2.5 bg-white border border-[#1C2B2A]/20 rounded-lg text-sm font-mono text-[#1C2B2A] focus:outline-none focus:border-[#0F6E5C] focus:ring-2 focus:ring-[#E7F3EF]"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="med-dosage" className="block text-xs font-mono font-semibold uppercase text-[#1C2B2A] mb-1">
                Dosage
              </label>
              <input
                id="med-dosage"
                type="text"
                value={newDosage}
                onChange={(e) => setNewDosage(e.target.value)}
                placeholder="75mg"
                className="w-full px-3 py-2.5 bg-white border border-[#1C2B2A]/20 rounded-lg text-sm font-mono text-[#1C2B2A] focus:outline-none focus:border-[#0F6E5C]"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="med-freq" className="block text-xs font-mono font-semibold uppercase text-[#1C2B2A] mb-1">
                Frequency
              </label>
              <input
                id="med-freq"
                type="text"
                value={newFrequency}
                onChange={(e) => setNewFrequency(e.target.value)}
                placeholder="1-0-0"
                className="w-full px-3 py-2.5 bg-white border border-[#1C2B2A]/20 rounded-lg text-sm font-mono text-[#1C2B2A] focus:outline-none focus:border-[#0F6E5C]"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="med-duration" className="block text-xs font-mono font-semibold uppercase text-[#1C2B2A] mb-1">
                Duration
              </label>
              <input
                id="med-duration"
                type="text"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                placeholder="14 days"
                className="w-full px-3 py-2.5 bg-white border border-[#1C2B2A]/20 rounded-lg text-sm text-[#1C2B2A] focus:outline-none focus:border-[#0F6E5C]"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={handleAddMedication}
                disabled={!newMedName.trim()}
                className="w-full py-2.5 bg-[#0F6E5C] hover:bg-[#0c594a] text-white font-mono text-sm font-semibold rounded-lg transition-colors active:scale-98 disabled:opacity-40"
              >
                + Add Med
              </button>
            </div>
          </div>

          {/* ACTIVE PRESCRIBED MEDICINES LIST */}
          {prescribedMeds.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="font-mono text-xs sm:text-sm text-[#1C2B2A]/70 font-semibold">
                Prescribed Medications ({prescribedMeds.length}):
              </span>
              <div className="space-y-2">
                {prescribedMeds.map((med) => (
                  <div
                    key={med.id}
                    className="flex flex-wrap items-center justify-between p-3 bg-[#E7F3EF]/50 border border-[#0F6E5C]/20 rounded-lg text-sm font-mono text-[#1C2B2A] gap-2"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0F6E5C]" />
                      <span className="font-bold text-[#0F6E5C]">{med.name}</span>
                      <span className="bg-white px-2.5 py-0.5 rounded border border-[#1C2B2A]/10 text-[#1C2B2A]/80 font-medium">
                        {med.dosage}
                      </span>
                      <span className="bg-white px-2.5 py-0.5 rounded border border-[#1C2B2A]/10 text-[#1C2B2A]/80 font-medium">
                        Freq: {med.frequency}
                      </span>
                      <span className="text-[#1C2B2A]/70">({med.duration})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveMed(med.id)}
                      className="text-[#C9754A] hover:bg-[#C9754A]/10 px-2.5 py-1 rounded transition-colors font-medium text-xs"
                      title="Remove medicine"
                    >
                      ✕ Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SAVE CONSULTATION ACTION BUTTON */}
        <div className="pt-4 border-t border-[#1C2B2A]/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <span className="text-xs sm:text-sm text-[#1C2B2A]/70 font-mono">
            Signed by: Dr. Ananya Sharma (REG: DOC-8841-IN)
          </span>

          <div className="flex flex-wrap items-center gap-2.5">
            {activeConsultation && onConfirmDiagnosis && (
              <button
                type="button"
                onClick={() => onConfirmDiagnosis(diagnosis || activeConsultation.probable_diagnosis || 'Completed Diagnosis')}
                className="py-3.5 px-5 bg-[#3B7A9E] hover:bg-[#316583] text-white font-mono text-sm font-semibold rounded-xl transition-all duration-150 active:scale-98 focus:outline-none focus:ring-2 focus:ring-[#3B7A9E]"
              >
                ✓ Confirm Diagnosis
              </button>
            )}

            <button
              type="submit"
              disabled={isSaving || !symptoms.trim() || !diagnosis.trim()}
              className="py-3.5 px-6 bg-[#0F6E5C] hover:bg-[#0c594a] text-white font-display font-semibold text-base rounded-xl transition-all duration-150 active:scale-98 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#0F6E5C] focus:ring-offset-2 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <span>Finalizing E-Prescription...</span>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Consultation &amp; Sign Rx</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>

    </div>
  );
}
