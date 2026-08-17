import dotenv from 'dotenv';
dotenv.config();

const requiredEnv = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'GEMINI_API_KEY',
  'OPENROUTER_API_KEY'
];

const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
  throw new Error(`CRITICAL STARTUP ERROR: Missing required environment variables: ${missingEnv.join(', ')}`);
}

export const config = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  NODE_ENV: process.env.NODE_ENV || 'development'
};

export default config;
