import React, { createContext, useContext, useState, useCallback } from 'react';
import doctorService from '../services/doctorService';
import { useAuth } from './AuthContext';

const DoctorContext = createContext(null);

export function DoctorProvider({ children }) {
  const { user, profile } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Active consultation & prescription state
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [prescribedMeds, setPrescribedMeds] = useState([]);
  const [isSavingConsultation, setIsSavingConsultation] = useState(false);

  // AI Drug-Interaction Alert state
  const [aiAlert, setAiAlert] = useState(null);

  // Lab Orders state
  const [labOrders, setLabOrders] = useState([]);
  const [isLoadingLabOrders, setIsLoadingLabOrders] = useState(false);

  // Real-time toast / feedback message state
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  // Helper to calculate age from date_of_birth
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return 'N/A';
    const ageDiffMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Fetch patient lab orders
  const fetchPatientLabOrders = useCallback(async (patientId) => {
    if (!patientId) return;
    setIsLoadingLabOrders(true);
    try {
      const orders = await doctorService.getLabOrdersForPatient(patientId);
      const mappedOrders = (orders || []).map(o => ({
        id: o.id,
        patientName: selectedPatient?.name || 'Patient',
        healthId: selectedPatient?.healthId || '',
        testName: o.test_name,
        facility: o.laboratory_id ? `Lab (${o.laboratory_id.slice(0, 8)})` : 'Unassigned Lab',
        priority: 'Routine',
        status: o.status === 'in_progress' ? 'In Progress' : o.status === 'completed' ? 'Report Ready' : 'Pending',
        rawStatus: o.status,
        orderedAt: o.ordered_at ? new Date(o.ordered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
      }));
      setLabOrders(mappedOrders);
    } catch (err) {
      console.error('Error fetching patient lab orders:', err);
    } finally {
      setIsLoadingLabOrders(false);
    }
  }, [selectedPatient?.name, selectedPatient?.healthId]);

  // Search patient by Health ID
  const handleSearchPatient = async (query) => {
    const healthIdToSearch = query.trim();
    if (!healthIdToSearch) return;

    setIsSearching(true);
    setSearchError(null);
    setAiAlert(null);
    setActiveConsultation(null);
    setPrescribedMeds([]);

    try {
      const patientData = await doctorService.searchPatientByHealthId(healthIdToSearch);

      // Fetch chronic conditions
      let conditionsList = [];
      try {
        const chronicData = await doctorService.getChronicConditionsForPatient(patientData.id);
        if (Array.isArray(chronicData)) {
          conditionsList = chronicData.map(c => c.condition_name || c.notes);
        }
      } catch (err) {
        if (patientData.chronic_conditions && Array.isArray(patientData.chronic_conditions)) {
          conditionsList = patientData.chronic_conditions.map(c => c.condition_name || c.notes);
        }
      }

      // Fetch consultation history timeline
      let historyTimeline = [];
      try {
        const consultations = await doctorService.getConsultationsForPatient(patientData.id);
        if (Array.isArray(consultations)) {
          historyTimeline = await Promise.all(
            consultations.map(async (c) => {
              let meds = [];
              try {
                const prescs = await doctorService.getPrescriptionsForConsultation(c.id);
                meds = (prescs || []).map(p => `${p.medicine_name} ${p.dosage || ''}`.trim());
              } catch (e) {
                // ignore prescription fetch error
              }
              return {
                id: c.id,
                date: c.consultation_date
                  ? new Date(c.consultation_date).toISOString().split('T')[0]
                  : (c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : 'N/A'),
                doctorName: c.doctor_id ? `Dr. (ID: ${c.doctor_id.slice(0, 6)})` : 'Doctor',
                clinic: 'SwasthyaSetu OPD',
                visitType: c.status || 'completed',
                diagnosis: c.confirmed_diagnosis || c.probable_diagnosis || 'No Diagnosis Recorded',
                prescribedMeds: meds,
                symptoms: c.symptoms,
                doctor_notes: c.doctor_notes,
              };
            })
          );
        }
      } catch (err) {
        console.error('Error fetching patient consultations:', err);
      }

      const formattedPatient = {
        id: patientData.id,
        user_id: patientData.user_id,
        name: patientData.full_name || 'Patient',
        healthId: patientData.health_id,
        gender: patientData.gender || 'N/A',
        age: calculateAge(patientData.date_of_birth),
        bloodGroup: patientData.blood_group || 'N/A',
        vitals: { bp: '120/80 mmHg', hr: '72 bpm', spo2: '98%', temp: '98.4°F' },
        conditions: conditionsList,
        allergies: [],
        history: historyTimeline,
        raw: patientData,
      };

      setSelectedPatient(formattedPatient);

      // Fetch lab orders for this patient
      fetchPatientLabOrders(patientData.id);
    } catch (error) {
      console.error('Patient search error:', error);
      setSelectedPatient(null);
      setSearchError(error.message || 'No patient found with this Health ID');
    } finally {
      setIsSearching(false);
    }
  };

  // Demo patient quick select fallback helper
  const handleSelectDemoPatient = (patient) => {
    setSearchQuery(patient.healthId || patient.health_id);
    handleSearchPatient(patient.healthId || patient.health_id);
  };

  // Create Consultation
  const handleSaveConsultation = async (consultData) => {
    if (!selectedPatient) {
      showFeedback('error', 'Please select a patient before saving consultation');
      return null;
    }

    setIsSavingConsultation(true);
    try {
      const payload = {
        patient_id: selectedPatient.id,
        symptoms: consultData.symptoms || 'General consultation',
        doctor_notes: consultData.clinicalNotes || consultData.doctor_notes || '',
        probable_diagnosis: consultData.diagnosis || consultData.probable_diagnosis || '',
      };

      const newConsultation = await doctorService.createConsultation(payload);
      setActiveConsultation(newConsultation);
      showFeedback('success', 'Consultation created successfully! Active in session.');

      // Update patient history timeline in local state
      setSelectedPatient((prev) => {
        if (!prev) return prev;
        const newHistoryItem = {
          id: newConsultation.id,
          date: newConsultation.created_at
            ? new Date(newConsultation.created_at).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          doctorName: profile?.full_name || 'Dr. ' + (user?.email || ''),
          clinic: 'SwasthyaSetu OPD',
          visitType: newConsultation.status || 'ongoing',
          diagnosis: newConsultation.probable_diagnosis || 'Ongoing Consultation',
          prescribedMeds: [],
          symptoms: newConsultation.symptoms,
          doctor_notes: newConsultation.doctor_notes,
        };
        return {
          ...prev,
          history: [newHistoryItem, ...(prev.history || [])],
        };
      });

      return newConsultation;
    } catch (error) {
      console.error('Save consultation error:', error);
      showFeedback('error', `Failed to save consultation: ${error.message}`);
      return null;
    } finally {
      setIsSavingConsultation(false);
    }
  };

  // Confirm / Complete Diagnosis
  const handleConfirmDiagnosis = async (confirmedDiagnosis) => {
    if (!activeConsultation) {
      showFeedback('error', 'No active consultation to confirm');
      return;
    }
    try {
      const updated = await doctorService.updateConsultation(activeConsultation.id, {
        confirmed_diagnosis: confirmedDiagnosis,
        status: 'completed',
      });
      setActiveConsultation(updated);
      showFeedback('success', 'Diagnosis confirmed and consultation completed!');
    } catch (error) {
      console.error('Confirm diagnosis error:', error);
      showFeedback('error', `Failed to confirm diagnosis: ${error.message}`);
    }
  };

  // Add Prescription & check AI drug interaction immediately
  const handleAddPrescription = async (medData) => {
    if (!selectedPatient) {
      showFeedback('error', 'No active patient selected');
      return;
    }

    let currentConsultation = activeConsultation;

    // Auto-create consultation if non-existent when adding prescription
    if (!currentConsultation) {
      currentConsultation = await handleSaveConsultation({
        symptoms: 'Prescription added during consultation',
        diagnosis: 'OPD Examination',
        clinicalNotes: 'Consultation initialized for e-prescribing',
      });
      if (!currentConsultation) {
        showFeedback('error', 'Could not create active consultation for prescription');
        return;
      }
    }

    try {
      const payload = {
        consultation_id: currentConsultation.id,
        medicine_name: medData.name,
        dosage: medData.dosage || '500mg',
        frequency: medData.frequency || '1-0-1',
        duration: medData.duration || '7 days',
        instructions: medData.instructions || 'Take as directed',
      };

      const createdPrescription = await doctorService.createPrescription(payload);

      const formattedMed = {
        id: createdPrescription.id,
        name: createdPrescription.medicine_name,
        dosage: createdPrescription.dosage,
        frequency: createdPrescription.frequency,
        duration: createdPrescription.duration,
        instructions: createdPrescription.instructions,
      };

      setPrescribedMeds((prev) => [...prev, formattedMed]);
      showFeedback('success', `Prescription created: ${createdPrescription.medicine_name}`);

      // IMMEDIATELY check drug interaction with AI
      try {
        const aiResponse = await doctorService.checkDrugInteraction(createdPrescription.id);
        if (aiResponse && aiResponse.interaction && aiResponse.interaction.hasInteraction) {
          setAiAlert({
            flagId: aiResponse.flag?.id,
            severity: (aiResponse.interaction.severity || 'HIGH RISK').toUpperCase(),
            flaggedPair: `${createdPrescription.medicine_name} + ${aiResponse.interaction.conflictingWith || 'Chronic Condition'}`,
            patientCondition: aiResponse.interaction.conflictingWith || selectedPatient.conditions?.[0] || 'Condition',
            explanation: aiResponse.interaction.explanation,
            acknowledged: aiResponse.flag?.acknowledged_by_doctor || false,
            raw: aiResponse,
          });
        } else {
          setAiAlert(null);
        }
      } catch (aiErr) {
        console.error('Error checking drug interaction:', aiErr);
      }

    } catch (error) {
      console.error('Create prescription error:', error);
      showFeedback('error', `Failed to create prescription: ${error.message}`);
    }
  };

  // Acknowledge AI Drug Interaction Flag
  const handleAcknowledgeAlert = async (flagData) => {
    let flagId = typeof flagData === 'string' ? flagData : flagData?.flagId || aiAlert?.flagId;
    
    if (flagId) {
      try {
        await doctorService.acknowledgeInteractionFlag(flagId);
        setAiAlert((prev) => (prev ? { ...prev, acknowledged: true } : null));
        showFeedback('success', 'Drug interaction flag acknowledged by doctor.');
        return;
      } catch (error) {
        console.error('Acknowledge alert error:', error);
        showFeedback('error', `Failed to acknowledge flag: ${error.message}`);
      }
    }
    // Fallback UI update
    setAiAlert((prev) => (prev ? { ...prev, acknowledged: true } : null));
  };

  // Create Lab Order
  const handleLabOrderSubmit = async (orderInput) => {
    if (!selectedPatient) {
      showFeedback('error', 'Please select a patient first');
      return;
    }

    let currentConsultation = activeConsultation;
    if (!currentConsultation) {
      currentConsultation = await handleSaveConsultation({
        symptoms: 'Lab test ordered',
        diagnosis: 'Diagnostic Investigation',
        clinicalNotes: 'Consultation initialized for lab order dispatch',
      });
      if (!currentConsultation) {
        showFeedback('error', 'Could not create active consultation for lab order');
        return;
      }
    }

    try {
      const testName = typeof orderInput === 'string' ? orderInput : orderInput?.testName || 'Laboratory Test';
      const payload = {
        consultation_id: currentConsultation.id,
        patient_id: selectedPatient.id,
        test_name: testName,
      };

      const newOrder = await doctorService.createLabOrder(payload);
      showFeedback('success', `Lab order "${newOrder.test_name}" transmitted!`);

      // Refresh lab orders list
      fetchPatientLabOrders(selectedPatient.id);
    } catch (error) {
      console.error('Create lab order error:', error);
      showFeedback('error', `Failed to transmit lab order: ${error.message}`);
    }
  };

  const handleApplyAlternativeDrug = (altDrugObj) => {
    if (altDrugObj) {
      handleAddPrescription(altDrugObj);
    }
    setAiAlert(null);
  };

  const value = {
    searchQuery,
    setSearchQuery,
    isSearching,
    searchError,
    selectedPatient,
    setSelectedPatient,
    activeConsultation,
    handleSearchPatient,
    handleSelectDemoPatient,
    prescribedMeds,
    setPrescribedMeds,
    handleAddPrescription,
    isSavingConsultation,
    handleSaveConsultation,
    handleConfirmDiagnosis,
    aiAlert,
    setAiAlert,
    handleAcknowledgeAlert,
    labOrders,
    setLabOrders,
    isLoadingLabOrders,
    fetchPatientLabOrders,
    handleLabOrderSubmit,
    handleApplyAlternativeDrug,
    feedback,
    showFeedback,
  };

  return (
    <DoctorContext.Provider value={value}>
      {children}
    </DoctorContext.Provider>
  );
}

export function useDoctor() {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error('useDoctor must be used within a DoctorProvider');
  }
  return context;
}
