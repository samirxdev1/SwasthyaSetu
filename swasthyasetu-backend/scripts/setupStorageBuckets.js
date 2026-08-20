import supabase from '../src/config/supabaseClient.js';
import { STORAGE_BUCKETS } from '../src/constants/storageBuckets.js';

async function setupBuckets() {
  console.log('🔄 Setting up Supabase Storage Buckets...');

  if (!supabase) {
    console.error('❌ Supabase client is not initialized. Check your environment variables.');
    process.exit(1);
  }

  const requiredBuckets = [
    { name: STORAGE_BUCKETS.LAB_REPORTS, public: false },
    { name: STORAGE_BUCKETS.PRESCRIPTION_SCANS, public: false }
  ];

  try {
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      process.exit(1);
    }

    const existingNames = (existingBuckets || []).map(b => b.name);
    console.log('📦 Existing buckets in Supabase:', existingNames);

    for (const b of requiredBuckets) {
      if (existingNames.includes(b.name)) {
        console.log(`✅ Bucket '${b.name}' already exists.`);
      } else {
        console.log(`🚀 Creating private bucket '${b.name}'...`);
        const { data, error } = await supabase.storage.createBucket(b.name, {
          public: b.public,
          fileSizeLimit: 10485760 // 10MB
        });

        if (error) {
          console.error(`❌ Failed to create bucket '${b.name}':`, error.message);
        } else {
          console.log(`🎉 Bucket '${b.name}' created successfully (Private)!`);
        }
      }
    }

    // List buckets again to verify
    const { data: finalBuckets } = await supabase.storage.listBuckets();
    console.log('🏁 Final bucket list in Supabase:', (finalBuckets || []).map(b => `${b.name} (public: ${b.public})`));
  } catch (err) {
    console.error('❌ Unexpected error during setup:', err);
    process.exit(1);
  }
}

setupBuckets();
