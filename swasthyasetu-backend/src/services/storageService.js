import supabase from '../config/supabaseClient.js';
import config from '../config/env.js';

const isPlaceholderConfig = () => {
  return !config.SUPABASE_URL || config.SUPABASE_URL.includes('placeholder');
};

export const uploadReportFile = async (fileBuffer, fileName, mimeType, bucketName = 'lab-reports') => {
  const sanitizedFileName = fileName ? fileName.replace(/[^a-zA-Z0-9._-]/g, '_') : 'report.pdf';
  const filePath = `reports/${Date.now()}_${sanitizedFileName}`;

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileBuffer, {
          contentType: mimeType,
          upsert: true
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        if (publicUrlData && publicUrlData.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (err) {
      console.warn('Supabase storage upload error, returning fallback URL:', err.message);
    }
  }

  // Fallback public URL
  return `${config.SUPABASE_URL}/storage/v1/object/public/${bucketName}/${filePath}`;
};

export default {
  uploadReportFile
};
