/**
 * fingerprintMatchService.js — Open-source ISO 19794-2 / ANSI 378 Minutiae Template
 * parser & 1:N fingerprint matching engine for SwasthyaSetu backend.
 */

/**
 * Parses an ISO 19794-2 (FMR) or ANSI 378 Base64 fingerprint template
 * and extracts minutiae points (x, y, angle, quality).
 */
export const extractMinutiae = (base64Template) => {
  if (!base64Template || typeof base64Template !== 'string') return [];

  try {
    const buf = Buffer.from(base64Template, 'base64');
    if (buf.length < 28) return [];

    const minutiae = [];

    // Detect header length and minutiae count
    let numMinutiae = 0;
    let startOffset = 28;

    // ISO 19794-2 header parsing
    if (buf.length >= 30) {
      numMinutiae = buf[26] || buf[24] || buf[27] || 0;
      if (numMinutiae === 0 || numMinutiae > 150) {
        // Fallback search for minutiae count byte
        numMinutiae = Math.min(120, Math.floor((buf.length - 28) / 6));
      }
    }

    let offset = startOffset;
    while (offset + 6 <= buf.length && minutiae.length < 150) {
      const b0 = buf[offset];
      const b1 = buf[offset + 1];
      const b2 = buf[offset + 2];
      const b3 = buf[offset + 3];
      const angleByte = buf[offset + 4];
      const quality = buf[offset + 5];

      const type = (b0 & 0xc0) >> 6;
      const x = ((b0 & 0x3f) << 8) | b1;
      const y = ((b2 & 0x3f) << 8) | b3;
      const angle = Math.round(angleByte * (360 / 256));

      if (x >= 0 && x < 2000 && y >= 0 && y < 2000) {
        minutiae.push({ x, y, angle, type, quality });
      }

      offset += 6;
    }

    return minutiae;
  } catch (err) {
    console.warn('Minutiae extraction warning:', err.message);
    return [];
  }
};

/**
 * Compares two ISO 19794-2 / ANSI 378 Base64 fingerprint templates.
 * Returns a match confidence score between 0 and 100.
 */
export const compareTemplates = (templateA, templateB) => {
  if (!templateA || !templateB) return 0;
  if (templateA === templateB) return 100;

  const minutiaeA = extractMinutiae(templateA);
  const minutiaeB = extractMinutiae(templateB);

  // If minutiae points cannot be extracted from binary header, fallback to string similarity
  if (minutiaeA.length < 5 || minutiaeB.length < 5) {
    return stringSimilarityScore(templateA, templateB);
  }

  let maxMatchedPairs = 0;
  const maxDistanceThreshold = 20; // Spatial distance threshold in pixels
  const maxAngleThreshold = 30; // Angular threshold in degrees

  // Try aligning using candidate reference minutiae pairs
  const candidatePairsA = minutiaeA.slice(0, Math.min(12, minutiaeA.length));
  const candidatePairsB = minutiaeB.slice(0, Math.min(12, minutiaeB.length));

  for (const mA of candidatePairsA) {
    for (const mB of candidatePairsB) {
      const deltaX = mA.x - mB.x;
      const deltaY = mA.y - mB.y;
      const deltaAngle = (mA.angle - mB.angle + 360) % 360;

      let currentMatched = 0;
      const usedIndicesB = new Set();

      for (const ptA of minutiaeA) {
        // Rotate and translate ptB
        const rad = (deltaAngle * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        for (let j = 0; j < minutiaeB.length; j++) {
          if (usedIndicesB.has(j)) continue;

          const ptB = minutiaeB[j];
          const rotatedX = Math.round(ptB.x * cos - ptB.y * sin) + deltaX;
          const rotatedY = Math.round(ptB.x * sin + ptB.y * cos) + deltaY;
          const rotatedAngle = (ptB.angle + deltaAngle + 360) % 360;

          const dist = Math.hypot(ptA.x - rotatedX, ptA.y - rotatedY);
          const angleDiff = Math.abs(ptA.angle - rotatedAngle);
          const minAngleDiff = Math.min(angleDiff, 360 - angleDiff);

          if (dist <= maxDistanceThreshold && minAngleDiff <= maxAngleThreshold) {
            currentMatched++;
            usedIndicesB.add(j);
            break;
          }
        }
      }

      if (currentMatched > maxMatchedPairs) {
        maxMatchedPairs = currentMatched;
      }
    }
  }

  const minSetSize = Math.min(minutiaeA.length, minutiaeB.length);
  if (minSetSize === 0) return 0;

  // Calculate percentage match relative to min set size
  const matchRatio = maxMatchedPairs / minSetSize;
  const confidenceScore = Math.min(100, Math.round(matchRatio * 100));

  return confidenceScore;
};

/**
 * Fallback similarity comparison for string-based templates
 */
const stringSimilarityScore = (str1, str2) => {
  if (str1 === str2) return 100;
  const len = Math.min(str1.length, str2.length);
  if (len === 0) return 0;
  let matches = 0;
  for (let i = 0; i < len; i += 4) {
    if (str1.slice(i, i + 4) === str2.slice(i, i + 4)) {
      matches++;
    }
  }
  return Math.min(100, Math.round((matches / (len / 4)) * 100));
};

/**
 * Performs a 1:N biometric search across all stored fingerprint templates.
 * @param {string} capturedTemplate - Base64 ISO/ANSI template captured from device
 * @param {Array<{patient_id: string, template_data: string}>} storedTemplates - All registered templates
 * @param {number} [threshold=35] - Minimum match score required to declare a match
 * @returns {{ patientId: string|null, score: number }}
 */
export const findMatchingPatient = (capturedTemplate, storedTemplates = [], threshold = 35) => {
  if (!capturedTemplate || !Array.isArray(storedTemplates) || storedTemplates.length === 0) {
    return { patientId: null, score: 0 };
  }

  let bestMatchPatientId = null;
  let highestScore = 0;

  for (const record of storedTemplates) {
    if (!record || !record.template_data) continue;
    const score = compareTemplates(capturedTemplate, record.template_data);
    console.log(`🔍 Biometric Match Check: Patient ${record.patient_id} Score = ${score}`);

    if (score > highestScore) {
      highestScore = score;
      bestMatchPatientId = record.patient_id;
    }
  }

  if (highestScore >= threshold && bestMatchPatientId) {
    return { patientId: bestMatchPatientId, score: highestScore };
  }

  return { patientId: null, score: highestScore };
};

export default {
  extractMinutiae,
  compareTemplates,
  findMatchingPatient,
};
