import dotenv from 'dotenv';

// Load primary .env
dotenv.config();

// Fallback to .env.example if key variables are missing
if (!process.env.SUPABASE_URL || !process.env.JWT_SECRET) {
  dotenv.config({ path: '.env.example' });
}

const requiredEnv = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'GEMINI_API_KEY',
  'OPENROUTER_API_KEY'
];

const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`CRITICAL STARTUP ERROR: Missing required environment variables: ${missingEnv.join(', ')}`);
  } else {
    console.warn(`⚠️ WARNING: Missing env variables (${missingEnv.join(', ')}). Using development fallbacks.`);
  }
}

const formatSupabaseUrl = (rawUrl) => {
  if (!rawUrl) return rawUrl;
  let cleanUrl = rawUrl.trim().replace(/\/+$/, '');
  if (cleanUrl.startsWith('db.')) {
    cleanUrl = 'https://' + cleanUrl.slice(3);
  } else if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }
  return cleanUrl;
};

export const config = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  SUPABASE_URL: formatSupabaseUrl(process.env.SUPABASE_URL),
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  NODE_ENV: process.env.NODE_ENV || 'development'
};

export default config;
