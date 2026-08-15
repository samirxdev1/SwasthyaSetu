import React, { useState, useEffect } from 'react';
import DoctorLayout from '../../layouts/DoctorLayout';
import PatientSearchBar from '../../components/doctor/PatientSearchBar';
import PatientHistoryCard from '../../components/doctor/PatientHistoryCard';
import ConsultationForm from '../../components/doctor/ConsultationForm';
import AIDrugAlertCard from '../../components/doctor/AIDrugAlertCard';
import LabOrderPanel from '../../components/doctor/LabOrderPanel';

/**
 * Demo Mock Patient Database for Clinical Testing
 */
const MOCK_PATIENTS = [
  {
    id: 'P-101',
    name: 'Rajesh Kumar',
    healthId: 'AB-9823-4011-9022',
    gender: 'Male',
    age: 54,
    bloodGroup: 'B+',
    vitals: { bp: '138/88 mmHg', hr: '78 bpm', spo2: '97%', temp: '98.6°F' },
    conditions: ['Essential Hypertension (4 yrs)', 'Type 2 Diabetes Mellitus', 'Hyperlipidemia'],
    allergies: ['Penicillin', 'Sulfa drugs'],
    history: [
      {
        id: 'VIS-901',
        date: '2026-07-14',
        doctorName: 'Dr. A. Sharma (Cardiology)',
        clinic: 'AIIMS OPD-4',
        visitType: 'Quarterly Checkup',
        diagnosis: 'Essential Hypertension - Moderate control',
        prescribedMeds: ['Metformin 500mg', 'Lisinopril 10mg'],
      },
      {
        id: 'VIS-782',
        date: '2026-04-10',
        doctorName: 'Dr. V. Rao (Endocrinology)',
        clinic: 'OPD Terminal-1',
        visitType: 'Routine OPD',
        diagnosis: 'Type 2 Diabetes Mellitus - HbA1c 7.4%',
        prescribedMeds: ['Metformin 500mg', 'Atorvastatin 20mg'],
      },
    ],
  },
  {
    id: 'P-102',
    name: 'Priya Sharma',
    healthId: 'AB-4412-9031-1189',
    gender: 'Female',
    age: 42,
    bloodGroup: 'O+',
    vitals: { bp: '124/80 mmHg', hr: '72 bpm', spo2: '99%', temp: '98.4°F' },
    conditions: ['Mild Asthmatic Bronchitis', 'Seasonal Rhinitis'],
    allergies: ['NSAIDs / Ibuprofen'],
    history: [
      {
        id: 'VIS-650',
        date: '2026-06-22',
        doctorName: 'Dr. S. Mehta (Pulmonology)',
        clinic: 'Specialist Clinic',
        visitType: 'Acute OPD',
        diagnosis: 'Bronchial Spasm - Mild Exacerbation',
        prescribedMeds: ['Levosalbutamol Inhaler', 'Montelukast 10mg'],
      },
    ],
  },
  {
    id: 'P-103',
    name: 'Amit Patel',
    healthId: 'AB-7721-8890-3341',
    gender: 'Male',
    age: 61,
    bloodGroup: 'A+',
    vitals: { bp: '144/92 mmHg', hr: '82 bpm', spo2: '96%', temp: '98.8°F' },
    conditions: ['Chronic Kidney Disease (Stage 2)', 'Ischemic Heart Disease'],
    allergies: ['Contrast Dye'],
    history: [
      {
        id: 'VIS-401',
        date: '2026-05-18',
        doctorName: 'Dr. A. Sharma (Cardiology)',
        clinic: 'Cardiology Clinic',
        visitType: 'Post-Angio Follow-up',
        diagnosis: 'Coronary Artery Disease - Stable',
        prescribedMeds: ['Warfarin 5mg', 'Atorvastatin 40mg'],
      },
    ],
  },
];

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Patient search & selection state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(MOCK_PATIENTS[0]);

  // Consultation state
  const [prescribedMeds, setPrescribedMeds] = useState([
    { id: 1, name: 'Metformin', dosage: '500mg', frequency: '1-0-1', duration: '30 days' },
  ]);
  const [isSavingConsultation, setIsSavingConsultation] = useState(false);

  // AI Drug-Interaction Alert state
  const [aiAlert, setAiAlert] = useState(null);

  // Lab Orders state
  const [labOrders, setLabOrders] = useState([
    {
      id: 'LAB-ORD-9021',
      patientName: 'Rajesh Kumar',
      healthId: 'AB-9823-4011-9022',
      testName: 'Lipid Profile (Full)',
      facility: 'Central NABL Diagnostic Hub (LAB-3021)',
      priority: 'Routine',
      status: 'Report Ready',
      orderedAt: '09:30 AM',
    },
    {
      id: 'LAB-ORD-9022',
      patientName: 'Priya Sharma',
      healthId: 'AB-4412-9031-1189',
      testName: 'HbA1c & Fasting Glucose',
      facility: 'Central NABL Diagnostic Hub (LAB-3021)',
      priority: 'Urgent',
      status: 'In Progress',
      orderedAt: '10:15 AM',
    },
    {
      id: 'LAB-ORD-9023',
      patientName: 'Amit Patel',
      healthId: 'AB-7721-8890-3341',
      testName: 'Serum Creatinine & Electrolytes',
      facility: 'AIIMS OPD Lab Terminal-2',
      priority: 'STAT',
      status: 'Pending',
      orderedAt: '11:05 AM',
    },
  ]);

  // Handle patient lookup
  const handleSearchPatient = (query) => {
    setIsSearching(true);
    setTimeout(() => {
      const found = MOCK_PATIENTS.find(
        p => p.healthId.toLowerCase().includes(query.toLowerCase()) ||
             p.name.toLowerCase().includes(query.toLowerCase())
      );
      if (found) {
        setSelectedPatient(found);
      } else {
        // Fallback default search result for demonstration
        setSelectedPatient({
          id: `P-${Date.now()}`,
          name: query.length > 3 ? query : 'Searched Patient',
          healthId: query.startsWith('AB') ? query : `AB-${Math.floor(1000 + Math.random() * 9000)}-4011-9022`,
          gender: 'Male',
          age: 48,
          bloodGroup: 'B+',
          vitals: { bp: '130/84 mmHg', hr: '76 bpm', spo2: '98%', temp: '98.6°F' },
          conditions: ['Hypertension'],
          allergies: [],
          history: [
            {
              id: 'VIS-NEW',
              date: '2026-08-01',
              doctorName: 'Dr. A. Sharma',
              clinic: 'General OPD',
              visitType: 'Initial Consult',
              diagnosis: 'Hypertensive Risk Evaluation',
              prescribedMeds: ['Lisinopril 5mg'],
            }
          ]
        });
      }
      setIsSearching(false);
    }, 250);
  };

  const handleSelectDemoPatient = (patient) => {
    setSearchQuery(patient.healthId);
    handleSearchPatient(patient.healthId);
  };

  // Monitor e-prescription list and trigger AI Drug-Interaction Alert if conflicting medicines exist
  useEffect(() => {
    if (!prescribedMeds || prescribedMeds.length === 0) {
      setAiAlert(null);
      return;
    }

    const hasAspirin = prescribedMeds.some(m => m.name.toLowerCase().includes('aspirin'));
    const hasWarfarin = prescribedMeds.some(m => m.name.toLowerCase().includes('warfarin'));
    const hasLisinopril = prescribedMeds.some(m => m.name.toLowerCase().includes('lisinopril'));
    const hasMetformin = prescribedMeds.some(m => m.name.toLowerCase().includes('metformin'));

    // Check if patient conditions or prescribed drugs conflict
    if (hasAspirin && (hasWarfarin || selectedPatient?.conditions?.some(c => c.toLowerCase().includes('hypertension')))) {
      setAiAlert({
        severity: 'HIGH RISK (BLEEDING HAZARD)',
        flaggedPair: 'Aspirin 75mg + Warfarin 5mg',
        patientCondition: selectedPatient?.conditions?.[0] || 'Hypertension',
        explanation: 'Concurrent administration of Warfarin and Aspirin synergistically inhibits platelet aggregation and coagulation cascade, elevating internal GI hemorrhage risk by 3.4x in hypertensive patients.',
        alternative: 'Discontinue Aspirin. Use Clopidogrel 75mg daily if secondary antiplatelet prophylaxis is strictly indicated.',
        alternativeDrugName: 'Clopidogrel 75mg',
        alternativeDrugObj: { id: Date.now(), name: 'Clopidogrel', dosage: '75mg', frequency: '1-0-0', duration: '30 days' },
      });
    } else if (hasLisinopril && selectedPatient?.conditions?.some(c => c.toLowerCase().includes('kidney'))) {
      setAiAlert({
        severity: 'MODERATE RISK (RENAL FUNCTION)',
        flaggedPair: 'Lisinopril + Stage 2 CKD',
        patientCondition: 'Chronic Kidney Disease',
        explanation: 'ACE-inhibitors like Lisinopril reduce efferent arteriolar tone. Monitor serum creatinine and potassium within 7 days of initiation.',
        alternative: 'titrate Lisinopril with baseline renal profile check or consider ARB alternative with potassium monitoring.',
      });
    } else {
      setAiAlert(null);
    }
  }, [prescribedMeds, selectedPatient]);

  // Handle drug replacement from AI alert suggestion
  const handleApplyAlternativeDrug = (altDrug) => {
    if (!altDrug) return;
    // Replace Aspirin/Warfarin with Clopidogrel
    const updated = prescribedMeds.filter(m => !m.name.toLowerCase().includes('aspirin'));
    setPrescribedMeds([...updated, altDrug]);
    setAiAlert(null);
  };

  // Handle saving consultation
  const handleSaveConsultation = (consultData) => {
    setIsSavingConsultation(true);
    setTimeout(() => {
      setIsSavingConsultation(false);
      alert(`Consultation and E-Prescription saved successfully for ${selectedPatient.name} (${selectedPatient.healthId})!`);
    }, 400);
  };

  // Handle Lab Order Submit
  const handleLabOrderSubmit = (newOrder) => {
    setLabOrders([newOrder, ...labOrders]);
  };

  // Handle Lab Status Morph
  const handleLabStatusChange = (orderId, newStatus) => {
    setLabOrders(labOrders.map(ord => ord.id === orderId ? { ...ord, status: newStatus } : ord));
  };

  return (
    <DoctorLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      
      {/* WORKSTATION QUICK STATS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E7F3EF] shadow-sm flex items-center justify-between">
          <div>
            <span className="font-mono text-xs text-[#1C2B2A]/60 block uppercase font-semibold">Active Patients</span>
            <span className="font-display text-2xl font-bold text-[#0F6E5C]">14 Queued</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#E7F3EF] text-[#0F6E5C] flex items-center justify-center font-bold">
            OPD
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7F3EF] shadow-sm flex items-center justify-between">
          <div>
            <span className="font-mono text-xs text-[#1C2B2A]/60 block uppercase font-semibold">Pending Lab Reports</span>
            <span className="font-display text-2xl font-bold text-[#3B7A9E]">8 Reports</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#3B7A9E]/15 text-[#3B7A9E] flex items-center justify-center font-bold">
            LAB
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7F3EF] shadow-sm flex items-center justify-between">
          <div>
            <span className="font-mono text-xs text-[#1C2B2A]/60 block uppercase font-semibold">AI Drug Safety</span>
            <span className="font-display text-2xl font-bold text-[#C9754A]">
              {aiAlert ? '1 Flagged' : 'Active (0 Warnings)'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#C9754A]/15 text-[#C9754A] flex items-center justify-center font-bold">
            AI
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7F3EF] shadow-sm flex items-center justify-between">
          <div>
            <span className="font-mono text-xs text-[#1C2B2A]/60 block uppercase font-semibold">ABDM Sync Status</span>
            <span className="font-display text-2xl font-bold text-[#0F6E5C]">Verified</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#E7F3EF] text-[#0F6E5C] flex items-center justify-center font-bold">
            ABHA
          </div>
        </div>
      </div>

      {/* 1. PROMINENT PATIENT SEARCH BAR */}
      <PatientSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearchPatient}
        isSearching={isSearching}
        demoPatients={MOCK_PATIENTS}
        onSelectDemoPatient={handleSelectDemoPatient}
      />

      {/* 2. PATIENT HISTORY CARD (APPEARS AFTER SEARCH WITH 200ms SCALE FADE ENTRANCE) */}
      <PatientHistoryCard patient={selectedPatient} />

      {/* 3. AI DRUG-INTERACTION ALERT (STANDOUT WOW ELEMENT - MUTED CLAY ACCENT) */}
      {aiAlert && (
        <AIDrugAlertCard
          alertData={aiAlert}
          onAcknowledge={() => {}}
          onApplyAlternative={handleApplyAlternativeDrug}
        />
      )}

      {/* 4. ACTIVE CONSULTATION FORM */}
      <ConsultationForm
        patient={selectedPatient}
        prescribedMeds={prescribedMeds}
        setPrescribedMeds={setPrescribedMeds}
        onSaveConsultation={handleSaveConsultation}
        isSaving={isSavingConsultation}
      />

      {/* 5. DIAGNOSTIC LAB ORDERS PANEL (WITH 250ms MORPHING STATUS CHIPS) */}
      <LabOrderPanel
        patient={selectedPatient}
        orders={labOrders}
        onOrderSubmit={handleLabOrderSubmit}
        onStatusChange={handleLabStatusChange}
      />

    </DoctorLayout>
  );
}
