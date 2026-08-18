import { HumanMessage } from '@langchain/core/messages';
import { geminiModel } from '../config/llmClients.js';

/**
 * Extracts prescription details from an image buffer using Gemini.
 * @param {Buffer} imageBuffer - The binary image data
 * @returns {Promise<Object>} Structured prescription object
 */
export const extractPrescriptionFromImage = async (imageBuffer) => {
  if (!imageBuffer) {
    const error = new Error('No image buffer provided');
    error.statusCode = 400;
    throw error;
  }

  const base64Image = imageBuffer.toString('base64');

  const message = new HumanMessage({
    content: [
      {
        type: 'text',
        text: `You are an AI medical assistant specializing in reading handwritten or printed prescriptions.
Analyze the attached prescription image carefully.
Extract the medicines and details.
Return a valid JSON object matching the following structure:
{
  "medicines": [
    {
      "name": "string",
      "dosage": "string",
      "frequency": "string",
      "instructions": "string"
    }
  ],
  "explanation": "plain-language summary of the prescription instructions",
  "disclaimer": "This is AI-assisted reading and not a medical confirmation. Please verify with your doctor or pharmacist."
}

Rules:
1. If any medicine name, dosage, frequency, or instruction is unclear or illegible, set its value to "unclear" rather than guessing. Do not guess names of medicines.
2. Return ONLY the raw JSON object. Do not wrap the JSON output in markdown code blocks (like \`\`\`json ... \`\`\`), backticks, or any other formatting. Start with "{" and end with "}".`
      },
      {
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${base64Image}`
        }
      }
    ]
  });

  const response = await geminiModel.invoke([message]);
  
  let text = response.content;
  if (typeof text !== 'string') {
    text = JSON.stringify(text);
  }
  text = text.trim();
  
  // Strip code fences if the model output them despite instructions
  if (text.startsWith('```json')) {
    text = text.substring(7);
  } else if (text.startsWith('```')) {
    text = text.substring(3);
  }
  if (text.endsWith('```')) {
    text = text.substring(0, text.length - 3);
  }
  text = text.trim();

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse AI response as JSON:', text, err);
    throw new Error('AI returned an invalid JSON response format. Please try again.');
  }
};

/**
 * Checks for potential drug interactions between a new medicine, the patient's
 * chronic conditions, and their existing prescriptions using Gemini AI.
 * @param {string} newMedicine - Name and dosage of the new medicine
 * @param {Array} patientChronicConditions - Array of chronic condition objects
 * @param {Array} existingPrescriptions - Array of existing prescription objects
 * @returns {Promise<Object>} Interaction analysis result
 */
export const checkDrugInteraction = async (newMedicine, patientChronicConditions, existingPrescriptions) => {
  if (!newMedicine) {
    const error = new Error('newMedicine is required');
    error.statusCode = 400;
    throw error;
  }

  const conditionsList = patientChronicConditions && patientChronicConditions.length > 0
    ? patientChronicConditions.map(c => `${c.condition_name} (status: ${c.status || 'unknown'})`).join(', ')
    : 'None reported';

  const prescriptionsList = existingPrescriptions && existingPrescriptions.length > 0
    ? existingPrescriptions.map(p => `${p.medicine_name} ${p.dosage} (${p.frequency || 'unknown frequency'})`).join(', ')
    : 'None currently active';

  const message = new HumanMessage({
    content: `You are a clinical pharmacology assistant tool designed to help licensed doctors review potential drug interactions. The doctor always makes the final clinical decision — this is an advisory aid only, not an autonomous diagnostic system.

A doctor is prescribing: "${newMedicine}"

Patient's chronic conditions: ${conditionsList}

Patient's currently active prescriptions: ${prescriptionsList}

Analyze whether "${newMedicine}" could have clinically significant interactions with:
1. Any of the patient's chronic conditions (contraindications)
2. Any of the patient's existing prescriptions (drug-drug interactions)

Return ONLY a raw JSON object with this exact structure (no markdown, no code fences):
{
  "hasInteraction": true or false,
  "conflictingWith": "name of the conflicting drug or condition, or empty string if none",
  "severity": "low" or "moderate" or "high",
  "explanation": "clinical explanation of the interaction risk"
}

If there is no interaction, set hasInteraction to false, conflictingWith to "", severity to "low", and explanation to a brief statement confirming no significant interactions were found.`
  });

  const response = await geminiModel.invoke([message]);

  let text = response.content;
  if (typeof text !== 'string') {
    text = JSON.stringify(text);
  }
  text = text.trim();

  // Strip code fences if the model output them despite instructions
  if (text.startsWith('```json')) {
    text = text.substring(7);
  } else if (text.startsWith('```')) {
    text = text.substring(3);
  }
  if (text.endsWith('```')) {
    text = text.substring(0, text.length - 3);
  }
  text = text.trim();

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse AI drug interaction response as JSON:', text, err);
    throw new Error('AI returned an invalid JSON response format for drug interaction check. Please try again.');
  }
};

export default {
  extractPrescriptionFromImage,
  checkDrugInteraction
};
