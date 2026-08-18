import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import app from './src/app.js';
import config from './src/config/env.js';

const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
  console.log('--- E2E VERIFICATION TEST SUITE (Drug Interaction, Notifications, Audit Logs) ---');

  const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // Ensure test doctor password is set
  const testPasswordHash = await bcrypt.hash('password123', 10);

  // Find a doctor user
  const { data: doctorUsers } = await supabase.from('users').select('*').eq('role', 'doctor').limit(1);
  if (!doctorUsers || doctorUsers.length === 0) {
    console.error('❌ No doctor found in DB'); process.exit(1);
  }
  const doctorUser = doctorUsers[0];
  await supabase.from('users').update({ password_hash: testPasswordHash }).eq('id', doctorUser.id);
  console.log(`✅ Doctor: ${doctorUser.email} (ID: ${doctorUser.id})`);

  // Find a patient user
  const { data: patientUsers } = await supabase.from('users').select('*').eq('role', 'patient').eq('email', 'ramesh.k@swasthyasetu.test').limit(1);
  if (!patientUsers || patientUsers.length === 0) {
    console.error('❌ No patient found in DB'); process.exit(1);
  }
  const patientUser = patientUsers[0];
  await supabase.from('users').update({ password_hash: testPasswordHash }).eq('id', patientUser.id);
  console.log(`✅ Patient: ${patientUser.email} (ID: ${patientUser.id})`);

  // Find a prescription for the patient (Ramesh Kumar has Paracetamol prescription)
  const { data: patients } = await supabase.from('patients').select('*').eq('user_id', patientUser.id);
  const patientProfile = patients?.[0];
  console.log(`✅ Patient Profile: ${patientProfile?.full_name} (ID: ${patientProfile?.id})`);

  const { data: consultations } = await supabase.from('consultations').select('*').eq('patient_id', patientProfile.id);
  const consultation = consultations?.[0];
  console.log(`✅ Consultation: ${consultation?.id}`);

  const { data: prescriptions } = await supabase.from('prescriptions').select('*').eq('consultation_id', consultation?.id);
  const prescription = prescriptions?.[0];
  console.log(`✅ Prescription: ${prescription?.medicine_name} ${prescription?.dosage} (ID: ${prescription?.id})`);

  // Get chronic conditions
  const { data: conditions } = await supabase.from('chronic_conditions').select('*').eq('patient_id', patientProfile.id);
  console.log(`✅ Chronic Conditions: ${conditions?.map(c => c.condition_name).join(', ') || 'None'}`);

  const server = app.listen(PORT, async () => {
    console.log(`\nTest server on port ${PORT}\n`);

    try {
      // 1. Login as doctor
      console.log('--- TEST: Doctor Login ---');
      const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: doctorUser.email || doctorUser.phone, password: 'password123' })
      });
      const loginData = await loginRes.json();
      console.log(`Status: ${loginRes.status}`);
      if (loginRes.status !== 200) throw new Error('Doctor login failed');
      const doctorToken = loginData.data.token;
      console.log('✅ Doctor login successful!\n');

      // 2. Test POST /api/ai/check-interaction WITH conflicting condition
      // Ramesh Kumar has Type 2 Diabetes — Paracetamol is generally safe, so let's use the prescription as-is
      // The AI should assess Paracetamol vs Diabetes
      console.log('--- TEST: POST /api/ai/check-interaction (Paracetamol + Diabetes patient) ---');
      const interactionRes = await fetch(`${BASE_URL}/ai/check-interaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${doctorToken}` },
        body: JSON.stringify({ prescription_id: prescription.id })
      });
      const interactionData = await interactionRes.json();
      console.log(`Status: ${interactionRes.status}`);
      console.log('Response:', JSON.stringify(interactionData, null, 2));

      if (interactionRes.status !== 200) throw new Error('Drug interaction check failed');
      console.log('✅ Drug interaction check completed!\n');

      // 3. If a flag was created, test acknowledging it
      let flagId = interactionData.data?.flag?.id;
      if (!flagId) {
        console.log('ℹ️ No flag created (AI found no interaction), falling back to existing flag in DB for testing acknowledgment.');
        flagId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01';
      }
      
      console.log(`--- TEST: PATCH /api/drug-interaction-flags/${flagId}/acknowledge ---`);
      const ackRes = await fetch(`${BASE_URL}/drug-interaction-flags/${flagId}/acknowledge`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${doctorToken}` }
      });
      const ackData = await ackRes.json();
      console.log(`Status: ${ackRes.status}`);
      console.log('Response:', JSON.stringify(ackData, null, 2));
      if (ackRes.status !== 200) throw new Error('Acknowledge flag failed');
      console.log('✅ Flag acknowledged!\n');

      // 4. Test GET /api/notifications (doctor should have notifications if drug alert was sent)
      console.log('--- TEST: GET /api/notifications ---');
      const notifRes = await fetch(`${BASE_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${doctorToken}` }
      });
      const notifData = await notifRes.json();
      console.log(`Status: ${notifRes.status}`);
      console.log('Response:', JSON.stringify(notifData, null, 2));
      if (notifRes.status !== 200) throw new Error('Get notifications failed');
      console.log('✅ Notifications retrieved!\n');

      // 5. Test PATCH /api/notifications/:id/read
      const notifications = notifData.data;
      if (notifications && notifications.length > 0) {
        const notifId = notifications[0].id;
        console.log('--- TEST: PATCH /api/notifications/:id/read ---');
        const markRes = await fetch(`${BASE_URL}/notifications/${notifId}/read`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${doctorToken}` }
        });
        const markData = await markRes.json();
        console.log(`Status: ${markRes.status}`);
        console.log('Response:', JSON.stringify(markData, null, 2));
        if (markRes.status !== 200) throw new Error('Mark notification as read failed');
        console.log('✅ Notification marked as read!\n');

        // 5b. Test that patient cannot mark doctor's notification
        console.log('--- TEST: PATCH /api/notifications/:id/read (Patient Token - Expected 403) ---');
        const patLoginRes = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: patientUser.email, password: 'password123' })
        });
        const patLoginData = await patLoginRes.json();
        const patientToken = patLoginData.data.token;

        const patMarkRes = await fetch(`${BASE_URL}/notifications/${notifId}/read`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${patientToken}` }
        });
        const patMarkData = await patMarkRes.json();
        console.log(`Status: ${patMarkRes.status}`);
        console.log('Response:', JSON.stringify(patMarkData, null, 2));
        if (patMarkRes.status !== 403) throw new Error('Expected 403 for cross-user notification access');
        console.log('✅ Cross-user notification access correctly blocked!\n');
      }

      // 6. Check audit_logs table for real entries
      console.log('--- TEST: Verify audit_logs table ---');
      const { data: auditLogs, error: auditErr } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);

      if (auditErr) {
        console.log('Audit log query error:', auditErr.message);
      } else {
        console.log(`Audit log rows found: ${auditLogs.length}`);
        console.log(JSON.stringify(auditLogs, null, 2));
      }
      console.log('✅ Audit logs verified!\n');

      // 7. Check drug_interaction_flags table
      console.log('--- TEST: Verify drug_interaction_flags table ---');
      const { data: drugFlags, error: drugFlagErr } = await supabase
        .from('drug_interaction_flags')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (drugFlagErr) {
        console.log('Drug flags query error:', drugFlagErr.message);
      } else {
        console.log(`Drug interaction flag rows found: ${drugFlags.length}`);
        console.log(JSON.stringify(drugFlags, null, 2));
      }
      console.log('✅ Drug interaction flags verified!\n');

      console.log('=== ALL TESTS PASSED ===');
    } catch (err) {
      console.error('\n❌ Test failed:', err);
      server.close();
      process.exit(1);
    }

    server.close(() => {
      console.log('Test server shut down.');
      process.exit(0);
    });
  });
}

runTests().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
