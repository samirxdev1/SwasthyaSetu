import { createClient } from '@supabase/supabase-js';
import config from './src/config/env.js';

function maskKey(key) {
  if (!key || key.length < 8) return '****';
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
}

async function runDiagnostics() {
  console.log('================ SUPABASE DIAGNOSTIC SUITE ================');

  // STEP 1 & 4: Config & RLS Key Inspection
  console.log('\n--- STEP 1 & 4: Config & RLS Key Inspection ---');
  console.log(`SUPABASE_URL: ${config.SUPABASE_URL}`);
  console.log(`Service Role Key (Used): ${maskKey(config.SUPABASE_SERVICE_ROLE_KEY)}`);
  console.log(`Anon Key (In .env):       ${maskKey(process.env.SUPABASE_ANON_KEY)}`);

  const isServiceRole = config.SUPABASE_SERVICE_ROLE_KEY?.includes('service_role') || false;
  console.log(`Using Service Role Key (Bypasses RLS)? ${isServiceRole ? 'YES ✅' : 'NO ❌'}`);

  const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // Raw Test Query
  console.log('\n--- Raw Test Query (users table count/select) ---');
  const { data: rawUsers, error: rawError } = await supabase.from('users').select('id', { count: 'exact' }).limit(5);
  if (rawError) {
    console.error('❌ Direct Query Error:', rawError);
  } else {
    console.log(`✅ Direct Query Successful! User Count / Records Found: ${rawUsers.length}`, rawUsers);
  }

  // STEP 2: Insert 10 Fresh Dummy Records
  console.log('\n--- STEP 2: Inserting 10 Test Patient Records ---');

  const testPatients = [
    { health_id: '90010000000001', full_name: 'Test Patient One', date_of_birth: '1990-01-01', gender: 'male' },
    { health_id: '90010000000002', full_name: 'Test Patient Two', date_of_birth: '1991-02-02', gender: 'female' },
    { health_id: '90010000000003', full_name: 'Test Patient Three', date_of_birth: '1992-03-03', gender: 'male' },
    { health_id: '90010000000004', full_name: 'Test Patient Four', date_of_birth: '1993-04-04', gender: 'female' },
    { health_id: '90010000000005', full_name: 'Test Patient Five', date_of_birth: '1994-05-05', gender: 'other' },
    { health_id: '90010000000006', full_name: 'Test Patient Six', date_of_birth: '1995-06-06', gender: 'male' },
    { health_id: '90010000000007', full_name: 'Test Patient Seven', date_of_birth: '1996-07-07', gender: 'female' },
    { health_id: '90010000000008', full_name: 'Test Patient Eight', date_of_birth: '1997-08-08', gender: 'male' },
    { health_id: '90010000000009', full_name: 'Test Patient Nine', date_of_birth: '1998-09-09', gender: 'female' },
    { health_id: '90010000000010', full_name: 'Test Patient Ten', date_of_birth: '1999-10-10', gender: 'other' }
  ];

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < testPatients.length; i++) {
    const patientData = testPatients[i];
    console.log(`\nInserting #${i + 1}: ${patientData.full_name} (${patientData.health_id})...`);

    const { data: inserted, error: insertError } = await supabase
      .from('patients')
      .upsert([patientData], { onConflict: 'health_id' })
      .select();

    if (insertError) {
      console.error(`❌ Insert #${i + 1} Failed:`, insertError);
      failCount++;
    } else {
      console.log(`✅ Insert #${i + 1} Succeeded! Returned Record:`, inserted);
      successCount++;
    }
  }

  console.log(`\nInsert Summary: ${successCount} Succeeded, ${failCount} Failed.`);

  // STEP 3: Read Back What Was Inserted
  console.log('\n--- STEP 3: Read Back Patients Table Records ---');
  const { data: allPatients, error: readError } = await supabase
    .from('patients')
    .select('*');

  if (readError) {
    console.error('❌ Read Back Failed:', readError);
  } else {
    console.log(`✅ Read Back Successful! Total Rows in 'patients' table: ${allPatients ? allPatients.length : 0}`);
    console.log('Returned Patients Data:', JSON.stringify(allPatients, null, 2));
  }

  console.log('\n================ DIAGNOSTIC SUITE COMPLETE ================');
}

runDiagnostics().catch(console.error);
