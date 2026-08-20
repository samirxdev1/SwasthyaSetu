import { body, param, validationResult } from 'express-validator';
import { randomUUID } from 'crypto';
import aiService from '../services/aiService.js';
import aiChatService from '../services/aiChatService.js';
import prescriptionService from '../services/prescriptionService.js';
import consultationService from '../services/consultationService.js';
import patientService from '../services/patientService.js';
import notificationService from '../services/notificationService.js';
import auditService from '../services/auditService.js';
import storageService from '../services/storageService.js';
import { STORAGE_BUCKETS } from '../constants/storageBuckets.js';
import supabase from '../config/supabaseClient.js';
import config from '../config/env.js';
import { formatSuccess, formatError } from '../utils/responseFormatter.js';
import STATUS_CODES from '../constants/statusCodes.js';

const isPlaceholderConfig = () => {
  return !config.SUPABASE_URL || config.SUPABASE_URL.includes('placeholder');
};

const memoryDrugFlags = [];

export const validateCheckInteraction = [
  body('prescription_id').notEmpty().withMessage('prescription_id is required')
];

export const validateAcknowledgeFlag = [
  param('id').notEmpty().withMessage('Drug interaction flag ID is required')
];

export const validateChatMessage = [
  body('message')
    .notEmpty().withMessage('message is required')
    .isString().withMessage('message must be a string')
    .trim()
    .isLength({ min: 1, max: 2000 }).withMessage('message must be between 1 and 2000 characters'),
  body('conversationHistory')
    .optional()
    .isArray().withMessage('conversationHistory must be an array')
];

const checkValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    formatError(res, STATUS_CODES.BAD_REQUEST, 'Validation failed', errors.array());
    return false;
  }
  return true;
};

export const scanPrescription = async (req, res, next) => {
  try {
    if (!req.file) {
      return formatError(res, STATUS_CODES.BAD_REQUEST, 'Please upload a prescription image file.');
    }

    // Upload prescription image to Supabase Storage bucket 'prescription-scans'
    const sanitizedFileName = req.file.originalname ? req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_') : 'prescription.jpg';
    const userId = req.user?.id || 'anonymous';
    const storagePath = `scans/${userId}/${Date.now()}-${sanitizedFileName}`;

    let scanned_image_path = null;
    try {
      scanned_image_path = await storageService.uploadFile(
        STORAGE_BUCKETS.PRESCRIPTION_SCANS,
        storagePath,
        req.file.buffer,
        req.file.mimetype
      );
    } catch (uploadErr) {
      console.warn('Prescription scan image upload failed:', uploadErr.message);
      scanned_image_path = storagePath;
    }

    // Extract prescription details using Gemini vision
    const result = await aiService.extractPrescriptionFromImage(req.file.buffer);

    return formatSuccess(
      res,
      STATUS_CODES.OK,
      {
        scanned_image_path,
        ...result
      },
      'Prescription scanned and parsed successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const checkDrugInteraction = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const { prescription_id } = req.body;

    // 1. Fetch the prescription
    let prescription = null;
    if (!isPlaceholderConfig() && supabase) {
      try {
        const { data, error } = await supabase
          .from('prescriptions')
          .select('*')
          .eq('id', prescription_id)
          .single();
        if (!error && data) prescription = data;
      } catch (err) {
        console.warn('Supabase prescription fetch failed:', err.message);
      }
    }

    if (!prescription) {
      const error = new Error(`Prescription with ID '${prescription_id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    // 2. Fetch the consultation to get patient_id
    const consultation = await consultationService.getConsultationById(prescription.consultation_id);
    if (!consultation) {
      const error = new Error(`Consultation for this prescription not found`);
      error.statusCode = 404;
      throw error;
    }

    const patientId = consultation.patient_id;

    // 3. Fetch patient's chronic conditions and existing prescriptions
    const chronicConditions = await patientService.getChronicConditionsByPatientId(patientId);
    const existingPrescriptions = await patientService.getPatientPrescriptions(patientId);

    // Filter out the current prescription from the existing list
    const otherPrescriptions = existingPrescriptions.filter(p => p.id !== prescription_id);

    const newMedicine = `${prescription.medicine_name} ${prescription.dosage}`;

    // 4. Call AI service
    const aiResult = await aiService.checkDrugInteraction(newMedicine, chronicConditions, otherPrescriptions);

    // 5. Log audit
    await auditService.logAudit(req.user.id, 'checked_drug_interaction', 'prescriptions', prescription_id);

    // 6. If interaction found, create drug_interaction_flags row and notify doctor
    if (aiResult.hasInteraction) {
      const now = new Date().toISOString();
      const flagRecord = {
        id: randomUUID(),
        prescription_id,
        conflicting_with: aiResult.conflictingWith || 'Unknown',
        severity: aiResult.severity || 'moderate',
        ai_explanation: aiResult.explanation || 'AI detected a potential interaction.',
        acknowledged_by_doctor: false,
        created_at: now
      };

      let createdFlag = null;

      if (!isPlaceholderConfig() && supabase) {
        try {
          const { data, error } = await supabase
            .from('drug_interaction_flags')
            .insert([flagRecord])
            .select()
            .single();
          if (!error && data) createdFlag = data;
          if (error) console.warn('Supabase drug flag insert failed:', error.message);
        } catch (err) {
          console.warn('Supabase drug flag insert error:', err.message);
        }
      }

      if (!createdFlag) {
        memoryDrugFlags.push(flagRecord);
        createdFlag = flagRecord;
      }

      // Notify the doctor
      try {
        await notificationService.createNotification(
          req.user.id,
          'Drug Interaction Alert',
          `Potential ${aiResult.severity} severity interaction detected for ${prescription.medicine_name}: ${aiResult.explanation}`,
          'drug_alert'
        );
      } catch (notifErr) {
        console.warn('Failed to create drug alert notification:', notifErr.message);
      }

      return formatSuccess(res, STATUS_CODES.OK, {
        interaction: aiResult,
        flag: createdFlag
      }, 'Drug interaction detected and flagged');
    }

    // No interaction
    return formatSuccess(res, STATUS_CODES.OK, {
      interaction: aiResult,
      flag: null
    }, 'No drug interaction found');
  } catch (error) {
    next(error);
  }
};

export const acknowledgeFlag = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    const { id } = req.params;

    let updatedFlag = null;

    if (!isPlaceholderConfig() && supabase) {
      try {
        // Verify the flag exists
        const { data: existingFlag, error: fetchErr } = await supabase
          .from('drug_interaction_flags')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchErr || !existingFlag) {
          const error = new Error(`Drug interaction flag with ID '${id}' not found`);
          error.statusCode = 404;
          throw error;
        }

        const { data, error } = await supabase
          .from('drug_interaction_flags')
          .update({ acknowledged_by_doctor: true })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) updatedFlag = data;
      } catch (err) {
        if (err.statusCode) throw err;
        console.warn('Supabase acknowledge flag failed:', err.message);
      }
    }

    if (!updatedFlag) {
      const memFlag = memoryDrugFlags.find(f => f.id === id);
      if (!memFlag) {
        const error = new Error(`Drug interaction flag with ID '${id}' not found`);
        error.statusCode = 404;
        throw error;
      }
      memFlag.acknowledged_by_doctor = true;
      updatedFlag = { ...memFlag };
    }

    return formatSuccess(res, STATUS_CODES.OK, updatedFlag, 'Drug interaction flag acknowledged by doctor');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/chat
 * Patient-only: Chat with the AI assistant using real patient data fetched via tool-calling.
 * patientId is always sourced from req.user (JWT) — never from the request body.
 */
export const chatWithAssistant = async (req, res, next) => {
  try {
    if (!checkValidation(req, res)) return;

    // Security: patientId comes from the authenticated JWT only
    const userId = req.user.id;

    // Resolve the patients.id from the users.id stored in the JWT
    const patientProfile = await patientService.getPatientProfileByUserId(userId);
    const patientId = patientProfile.id;

    const { message, conversationHistory = [] } = req.body;

    const result = await aiChatService.chatWithPatientAssistant(
      patientId,
      message,
      conversationHistory
    );

    return formatSuccess(
      res,
      STATUS_CODES.OK,
      {
        reply: result.reply,
        toolsUsed: result.toolsUsed
      },
      'AI assistant response generated successfully'
    );
  } catch (error) {
    next(error);
  }
};

export default {
  scanPrescription,
  checkDrugInteraction,
  acknowledgeFlag,
  chatWithAssistant
};

