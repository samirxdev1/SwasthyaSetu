import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import patientService from './patientService.js';

/**
 * Builds a fresh set of LangChain tools for the given patientId.
 *
 * SECURITY: The patientId is injected by the backend via closure BEFORE these tools
 * are handed to the LLM. The LLM cannot supply, override, or influence which patientId
 * is queried — every tool call is structurally hard-bound to the authenticated patient.
 *
 * @param {string} patientId - The patients.id (UUID) of the authenticated patient
 * @returns {DynamicStructuredTool[]} Array of four LangChain tools
 */
export const buildPatientTools = (patientId) => {
  if (!patientId) {
    throw new Error('patientId is required to build patient tools');
  }

  // ── Tool 1: Consultations ─────────────────────────────────────────────────
  const getPatientConsultations = new DynamicStructuredTool({
    name: 'getPatientConsultations',
    description:
      "Fetches the patient's consultation history, including symptoms, doctor notes, and diagnoses. " +
      "Use this when the patient asks about past visits, diagnoses, or doctor consultations.",
    schema: z.object({}), // No LLM-supplied input — patientId is hard-bound via closure
    func: async () => {
      try {
        const consultations = await patientService.getPatientConsultations(patientId);
        return JSON.stringify(consultations, null, 2);
      } catch (err) {
        console.error('[aiChatTools] getPatientConsultations error:', err.message);
        return JSON.stringify({ error: 'Could not fetch consultation history at this time.' });
      }
    }
  });

  // ── Tool 2: Prescriptions ─────────────────────────────────────────────────
  const getPatientPrescriptions = new DynamicStructuredTool({
    name: 'getPatientPrescriptions',
    description:
      "Fetches all medicines ever prescribed to the patient, including dosage, frequency, and instructions. " +
      "Use this when the patient asks about medicines, dosages, or what they were prescribed.",
    schema: z.object({}),
    func: async () => {
      try {
        const prescriptions = await patientService.getPatientPrescriptions(patientId);
        return JSON.stringify(prescriptions, null, 2);
      } catch (err) {
        console.error('[aiChatTools] getPatientPrescriptions error:', err.message);
        return JSON.stringify({ error: 'Could not fetch prescription data at this time.' });
      }
    }
  });

  // ── Tool 3: Lab Orders + Reports ──────────────────────────────────────────
  const getPatientLabOrdersAndReports = new DynamicStructuredTool({
    name: 'getPatientLabOrdersAndReports',
    description:
      "Fetches the patient's lab test orders and their current status (pending/in_progress/completed), " +
      "plus any uploaded report summaries. " +
      "Use this when the patient asks about test results, pending reports, or lab status.",
    schema: z.object({}),
    func: async () => {
      try {
        const [labOrders, labReports] = await Promise.all([
          patientService.getPatientLabOrders(patientId),
          patientService.getPatientLabReports(patientId)
        ]);

        // Strip signed URLs — only safe, non-expiring metadata goes to the LLM
        const sanitizedReports = labReports.map(r => ({
          id: r.id,
          lab_order_id: r.lab_order_id,
          report_summary: r.report_summary,
          uploaded_at: r.uploaded_at,
          share_token: r.share_token
          // Intentionally excluding report_file_url (signed URL) and share_url
        }));

        return JSON.stringify({ lab_orders: labOrders, lab_reports: sanitizedReports }, null, 2);
      } catch (err) {
        console.error('[aiChatTools] getPatientLabOrdersAndReports error:', err.message);
        return JSON.stringify({ error: 'Could not fetch lab order and report data at this time.' });
      }
    }
  });

  // ── Tool 4: Chronic Conditions ────────────────────────────────────────────
  const getPatientChronicConditions = new DynamicStructuredTool({
    name: 'getPatientChronicConditions',
    description:
      "Fetches the patient's ongoing chronic conditions (e.g. diabetes, hypertension) and their current status. " +
      "Use this when the patient asks about their ongoing health conditions.",
    schema: z.object({}),
    func: async () => {
      try {
        const conditions = await patientService.getChronicConditionsByPatientId(patientId);
        return JSON.stringify(conditions, null, 2);
      } catch (err) {
        console.error('[aiChatTools] getPatientChronicConditions error:', err.message);
        return JSON.stringify({ error: 'Could not fetch chronic conditions at this time.' });
      }
    }
  });

  return [
    getPatientConsultations,
    getPatientPrescriptions,
    getPatientLabOrdersAndReports,
    getPatientChronicConditions
  ];
};

export default { buildPatientTools };
