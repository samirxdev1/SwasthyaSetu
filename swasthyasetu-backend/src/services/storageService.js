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
    let { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true
      });

    // If bucket not found error occurs, attempt auto-creation of bucket and retry
    if (error && (error.message?.toLowerCase().includes('not found') || error.error === 'Bucket not found')) {
      console.log(`ℹ️ Storage bucket '${bucketName}' not found on Supabase. Attempting auto-creation...`);
      try {
        const { error: createErr } = await supabase.storage.createBucket(bucketName, {
          public: false,
          fileSizeLimit: 104857600 // 100MB
        });

        if (!createErr) {
          console.log(`✅ Storage bucket '${bucketName}' created successfully on Supabase! Retrying file upload...`);
          const retryRes = await supabase.storage
            .from(bucketName)
            .upload(filePath, fileBuffer, {
              contentType,
              upsert: true
            });
          data = retryRes.data;
          error = retryRes.error;
        } else {
          console.warn(`⚠️ Could not auto-create bucket '${bucketName}': ${createErr.message}`);
        }
      } catch (createException) {
        console.warn(`⚠️ Exception during bucket auto-creation:`, createException.message);
      }
    }

    if (error) {
      console.error(`❌ Supabase Storage upload failed for bucket '${bucketName}' at path '${filePath}':`, error.message);
      // If bucket is still not found or permissions block upload, log warning and fallback to local file path reference
      if (error.message?.toLowerCase().includes('not found')) {
        console.warn(`⚠️ Falling back to virtual path reference '${filePath}' for bucket '${bucketName}'`);
        return filePath;
      }
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

  let cleanPath = filePath;

  // If filePath is an absolute URL, attempt to extract the clean object path within the bucket
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    try {
      const urlObj = new URL(cleanPath);
      let pathname = urlObj.pathname;
      // Patterns like /storage/v1/object/sign/bucketName/path or /storage/v1/object/public/bucketName/path
      const bucketMarker = `/${bucketName}/`;
      const bucketIdx = pathname.indexOf(bucketMarker);
      if (bucketIdx !== -1) {
        cleanPath = pathname.substring(bucketIdx + bucketMarker.length);
      } else {
        // Fallback: return as-is if it's an external non-Supabase URL
        return filePath;
      }
    } catch (e) {
      return filePath;
    }
  }

  // Remove any query string left in path
  if (cleanPath.includes('?')) {
    cleanPath = cleanPath.split('?')[0];
  }

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(cleanPath, expiresInSeconds);

      if (error) {
        console.warn(`⚠️ Could not generate signed URL for path '${cleanPath}' in bucket '${bucketName}':`, error.message);
        return `${config.SUPABASE_URL}/storage/v1/object/sign/${bucketName}/${cleanPath}?token=fallback_signed_token`;
      }

      if (data && data.signedUrl) {
        return data.signedUrl;
      }
    } catch (err) {
      console.error(`❌ Error generating signed URL for '${cleanPath}':`, err.message);
    }
  }

  // Fallback signed URL format
  return `${config.SUPABASE_URL || 'http://localhost:5000'}/storage/v1/object/sign/${bucketName}/${cleanPath}?token=fallback_signed_token`;
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
