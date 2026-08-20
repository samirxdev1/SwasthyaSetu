import supabase from '../config/supabaseClient.js';
import config from '../config/env.js';

const isPlaceholderConfig = () => {
  return !config.SUPABASE_URL || config.SUPABASE_URL.includes('placeholder');
};

/**
 * Uploads a file buffer to a private Supabase Storage bucket.
 * @param {string} bucketName - Name of the target storage bucket (e.g. 'lab-reports', 'prescription-scans')
 * @param {string} filePath - Target path inside the bucket (e.g. 'reports/order123-178695000-sample.pdf')
 * @param {Buffer} fileBuffer - Binary buffer of the uploaded file
 * @param {string} contentType - MIME type of the file (e.g. 'application/pdf', 'image/jpeg')
 * @returns {Promise<string>} The raw storage path inside the bucket
 */
export const uploadFile = async (bucketName, filePath, fileBuffer, contentType) => {
  if (!bucketName || !filePath || !fileBuffer) {
    const error = new Error('uploadFile requires bucketName, filePath, and fileBuffer');
    error.statusCode = 400;
    throw error;
  }

  if (!isPlaceholderConfig() && supabase) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true
      });

    if (error) {
      console.error(`❌ Supabase Storage upload failed for bucket '${bucketName}' at path '${filePath}':`, error.message);
      const uploadError = new Error(`Failed to upload file to storage bucket '${bucketName}': ${error.message}`);
      uploadError.statusCode = 500;
      throw uploadError;
    }

    if (data && data.path) {
      return data.path;
    }
  }

  // Fallback for memory/placeholder mode
  return filePath;
};

/**
 * Generates a time-limited signed URL for viewing/downloading a private storage file.
 * @param {string} bucketName - Name of the storage bucket
 * @param {string} filePath - Path of the file in the storage bucket
 * @param {number} expiresInSeconds - Expiry duration in seconds (default 3600 = 1 hour)
 * @returns {Promise<string>} Time-limited signed URL string
 */
export const getSignedUrl = async (bucketName, filePath, expiresInSeconds = 3600) => {
  if (!filePath) return null;

  // If filePath already looks like an absolute HTTP/HTTPS URL, return it directly or extract path
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    // If it's an old public URL format, try to extract relative path or return as is
    if (!filePath.includes('/storage/v1/object/public/')) {
      return filePath;
    }
  }

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, expiresInSeconds);

      if (error) {
        console.warn(`⚠️ Could not generate signed URL for path '${filePath}' in bucket '${bucketName}':`, error.message);
        // Surface error if critical or fallback to basic string format
        return `${config.SUPABASE_URL}/storage/v1/object/sign/${bucketName}/${filePath}?token=fallback_signed_token`;
      }

      if (data && data.signedUrl) {
        return data.signedUrl;
      }
    } catch (err) {
      console.error(`❌ Error generating signed URL for '${filePath}':`, err.message);
    }
  }

  // Fallback signed URL format
  return `${config.SUPABASE_URL || 'http://localhost:5000'}/storage/v1/object/sign/${bucketName}/${filePath}?token=fallback_signed_token`;
};

/**
 * Deletes a file from a Supabase Storage bucket.
 * @param {string} bucketName - Name of the storage bucket
 * @param {string} filePath - Path of the file to delete
 * @returns {Promise<boolean>} True if deleted successfully
 */
export const deleteFile = async (bucketName, filePath) => {
  if (!bucketName || !filePath) return false;

  if (!isPlaceholderConfig() && supabase) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error(`❌ Supabase Storage delete failed for '${filePath}':`, error.message);
      const deleteErr = new Error(`Failed to delete file from storage: ${error.message}`);
      deleteErr.statusCode = 500;
      throw deleteErr;
    }

    return Array.isArray(data) && data.length > 0;
  }

  return true;
};

// Legacy alias for backwards compatibility
export const uploadReportFile = async (fileBuffer, fileName, mimeType, bucketName = 'lab-reports') => {
  const sanitizedFileName = fileName ? fileName.replace(/[^a-zA-Z0-9._-]/g, '_') : 'report.pdf';
  const filePath = `reports/${Date.now()}_${sanitizedFileName}`;
  const path = await uploadFile(bucketName, filePath, fileBuffer, mimeType);
  return await getSignedUrl(bucketName, path, 3600);
};

export default {
  uploadFile,
  getSignedUrl,
  deleteFile,
  uploadReportFile
};
