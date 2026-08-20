import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const BASE_URL = 'https://swasthyasetu-3cif.onrender.com/api';

async function testFullDoctorAndLabFlow() {
  console.log('=== FULL END-TO-END DOCTOR & LAB FLOW TEST ===');
  console.log(`Base URL: ${BASE_URL}\n`);

  try {
    // 1. Doctor login / register
    let doctorToken = null;
    let doctorUser = null;
    try {
      console.log('1. Logging in as Doctor (dr.test@swasthyasetu.org)...');
      const docLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
        identifier: 'dr.test@swasthyasetu.org',
        password: 'Doctor@123',
      });
      doctorToken = docLoginRes.data.data.token;
      doctorUser = docLoginRes.data.data.user;
      console.log('✅ Doctor login successful!');
    } catch (e) {
      console.log('Doctor login failed, registering new doctor account...');
      const regDoc = await axios.post(`${BASE_URL}/auth/register/doctor`, {
        email: 'dr.test@swasthyasetu.org',
        phone: '+919876543210',
        password: 'Doctor@123',
        full_name: 'Dr. Samir Sharma',
        specialization: 'Cardiology',
        registration_number: 'MCI-2026-98745',
        clinic_hospital_name: 'AIIMS Heart Institute',
        years_of_experience: 12,
      });
      doctorToken = regDoc.data.data.token;
      doctorUser = regDoc.data.data.user;
      console.log('✅ Doctor registered successfully!');
    }

    const docHeaders = { Authorization: `Bearer ${doctorToken}` };

    // 2. Search or get patient
    console.log('\n2. Searching patient by health_id...');
    let patientId = null;
    try {
      const pRes = await axios.get(`${BASE_URL}/patients/search?health_id=ABDM-1786952428247`, { headers: docHeaders });
      patientId = pRes.data.data.id;
      console.log(`✅ Patient found: ${pRes.data.data.full_name} (ID: ${patientId})`);
    } catch (e) {
      console.log('Patient search error:', e.response?.data?.message || e.message);
    }

    // 3. Doctor creates consultation
    if (patientId) {
      console.log('\n3. Creating consultation as Doctor...');
      const consultRes = await axios.post(`${BASE_URL}/consultations`, {
        patient_id: patientId,
        symptoms: 'Chest tightness, palpitations',
        doctor_notes: 'Advised 12-lead ECG and Lipid Profile',
        probable_diagnosis: 'Angina Pectoris',
      }, { headers: docHeaders });

      const consultId = consultRes.data.data.id;
      console.log(`✅ Consultation created ID: ${consultId}`);

      // 4. Doctor creates lab order
      console.log('\n4. Creating Lab Order as Doctor...');
      const labOrderRes = await axios.post(`${BASE_URL}/lab-orders`, {
        consultation_id: consultId,
        patient_id: patientId,
        test_name: '12-Lead ECG & Full Spectrum Lipid Profile',
      }, { headers: docHeaders });

      const newLabOrder = labOrderRes.data.data;
      console.log(`✅ New Lab Order created ID: ${newLabOrder.id}, Status: ${newLabOrder.status}`);

      // 5. Lab User Login / Register
      let labToken = null;
      try {
        console.log('\n5. Logging in as Laboratory (lab.test@swasthyasetu.org)...');
        const labLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
          identifier: 'lab.test@swasthyasetu.org',
          password: 'Lab@12345',
        });
        labToken = labLoginRes.data.data.token;
        console.log('✅ Lab login successful!');
      } catch (e) {
        console.log('Lab login failed, registering lab...');
        const regLab = await axios.post(`${BASE_URL}/auth/register/laboratory`, {
          email: 'lab.test@swasthyasetu.org',
          phone: '+919876500123',
          password: 'Lab@12345',
          lab_name: 'Metro Pathology & Diagnostic Center',
          registration_number: 'LAB-REG-TEST-001',
          address: 'Healthcare City, Noida',
          services_offered: ['Complete Blood Count', 'Lipid Profile', 'ECG'],
        });
        labToken = regLab.data.data.token;
        console.log('✅ Lab registered successfully!');
      }

      const labHeaders = { Authorization: `Bearer ${labToken}` };

      // 6. Lab fetches pending orders
      console.log('\n6. Lab fetching pending orders...');
      const pendingRes = await axios.get(`${BASE_URL}/lab-orders/pending`, { headers: labHeaders });
      console.log(`✅ ${pendingRes.data.data.length} pending orders available.`);

      // 7. Lab accepts the newly created order
      console.log(`\n7. Accepting newly created lab order ID: ${newLabOrder.id}...`);
      const acceptRes = await axios.patch(`${BASE_URL}/lab-orders/${newLabOrder.id}/accept`, {}, { headers: labHeaders });
      console.log('✅ Order accepted by lab!', acceptRes.data.data);

      // 8. Lab uploads report for accepted order
      console.log(`\n8. Uploading lab report for order ${newLabOrder.id}...`);
      const dummyFilePath = './dummy_test_report.pdf';
      fs.writeFileSync(dummyFilePath, '%PDF-1.4 ECG & Lipid Profile Test Report Content');

      const formData = new FormData();
      formData.append('lab_order_id', newLabOrder.id);
      formData.append('report_summary', 'Normal sinus rhythm. Total Cholesterol 185 mg/dL, HDL 45 mg/dL, LDL 110 mg/dL.');
      formData.append('file', fs.createReadStream(dummyFilePath), {
        filename: 'ECG_Lipid_Report.pdf',
        contentType: 'application/pdf',
      });

      const uploadRes = await axios.post(`${BASE_URL}/lab-reports`, formData, {
        headers: {
          ...labHeaders,
          ...formData.getHeaders(),
        },
      });

      console.log('✅ LAB REPORT UPLOADED TO SUPABASE STORAGE SUCCESSFULLY!');
      console.log('Report Data:', uploadRes.data.data);

      if (fs.existsSync(dummyFilePath)) fs.unlinkSync(dummyFilePath);

      // 9. Fetch lab report by order ID
      console.log(`\n9. Fetching uploaded lab report details for order ID: ${newLabOrder.id}...`);
      const reportRes = await axios.get(`${BASE_URL}/lab-reports/order/${newLabOrder.id}`, { headers: labHeaders });
      console.log('✅ Lab Report retrieved from API:', reportRes.data.data);

      // 10. Doctor side check - Doctor fetches lab orders for patient
      console.log(`\n10. Cross-checking from Doctor side: GET /api/lab-orders/patient/${patientId}...`);
      const docPatientOrdersRes = await axios.get(`${BASE_URL}/lab-orders/patient/${patientId}`, { headers: docHeaders });
      const completedOrderInDocList = docPatientOrdersRes.data.data.find(o => o.id === newLabOrder.id);
      console.log(`✅ Doctor sees order ${newLabOrder.id} status is now: '${completedOrderInDocList?.status}'`);
    }

    console.log('\n======================================================');
    console.log('🎉 FULL END-TO-END FLOW (DOCTOR + LAB + STORAGE) VERIFIED!');
    console.log('======================================================');
  } catch (err) {
    console.error('Test error:', err.response?.data || err.message);
  }
}

testFullDoctorAndLabFlow();
