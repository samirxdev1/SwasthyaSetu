import { createClient } from '@supabase/supabase-js';
import config from './env.js';

let supabaseClient = null;

if (config.SUPABASE_URL && config.SUPABASE_SERVICE_ROLE_KEY && !config.SUPABASE_URL.includes('placeholder')) {
  try {
    supabaseClient = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    // Startup Diagnostic Query
    supabaseClient
      .from('users')
      .select('id')
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.error('❌ Supabase Startup Diagnostic Query Failed:', error.message);
        } else {
          console.log('✅ Supabase Connection Verified! Project URL:', config.SUPABASE_URL);
        }
      })
      .catch(err => {
        console.error('❌ Supabase Startup Connection Error:', err.message);
      });
  } catch (err) {
    console.warn('Could not initialize Supabase client:', err.message);
  }
} else {
  console.warn('Supabase URL/Key is placeholder. Operating in fallback memory mode.');
}

export const supabase = supabaseClient;
export default supabase;
