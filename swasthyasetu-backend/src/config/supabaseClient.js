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

    // Startup Diagnostic Query & Bucket Initialization
    supabaseClient
      .from('users')
      .select('id')
      .limit(1)
      .then(async ({ data, error }) => {
        if (error) {
          console.error('❌ Supabase Startup Diagnostic Query Failed:', error.message);
        } else {
          console.log('✅ Supabase Connection Verified! Project URL:', config.SUPABASE_URL);
          // Initialize required storage buckets if missing
          const requiredBuckets = ['lab-reports', 'prescription-scans'];
          for (const bName of requiredBuckets) {
            try {
              const { data: bucket, error: getErr } = await supabaseClient.storage.getBucket(bName);
              if (getErr || !bucket) {
                console.log(`ℹ️ Initializing storage bucket '${bName}'...`);
                const { error: createErr } = await supabaseClient.storage.createBucket(bName, { public: false });
                if (!createErr) {
                  console.log(`✅ Storage bucket '${bName}' created successfully on startup.`);
                }
              }
            } catch (bErr) {
              // Ignore bucket check error
            }
          }
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
