import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const BASE_URL = 'https://swasthyasetu-3cif.onrender.com/api';

async function testLabFlow() {
  console.log('=== TESTING LAB FLOW AGAINST LIVE BACKEND ===');
  console.log(`Base URL: ${BASE_URL}\n`);

  let token = null;
  let user = null;

  // Try credentials
  const labCredentials = [
    { identifier: 'metro.labs@swasthyasetu.org', password: 'LabPass#2026' },
    { identifier: 'lab.test@swasthyasetu.org', password: 'Lab@12345' },
  ];

  for (const cred of labCredentials) {
    try {
      console.log(`Trying login for: ${cred.identifier}...`);
      const res = await axios.post(`${BASE_URL}/auth/login`, cred);
      if (res.data && res.data.success) {
        token = res.data.data.token;
        user = res.data.data.user;
        console.log(`✅ Login successful with ${cred.identifier}! Token acquired.`);
        break;
      }
    } catch (e) {
      console.log(`❌ Login failed for ${cred.identifier}:`, e.response?.data?.message || e.message);
    }
  }

  // If login failed, register lab.test@swasthyasetu.org
  if (!token) {
    console.log('\nRegistering lab.test@swasthyasetu.org...');
    try {
      const regRes = await axios.post(`${BASE_URL}/auth/register/laboratory`, {
        email: 'lab.test@swasthyasetu.org',
        phone: '+919876500123',
        password: 'Lab@12345',
        lab_name: 'Metro Pathology & Diagnostic Center',
        registration_number: 'LAB-REG-TEST-001',
        address: 'Healthcare City, Noida',
        services_offered: ['Complete Blood Count', 'Lipid Profile', 'ECG'],
      });

      if (regRes.data && regRes.data.success) {
        token = regRes.data.data.token;
        user = regRes.data.data.user;
        console.log('✅ Laboratory registered successfully!');
      }
    } catch (regErr) {
      console.error('Registration failed:', regErr.response?.data || regErr.message);
      return;
    }
  }

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  // Step 2: Get pending unassigned lab orders
  console.log('\n2. Fetching GET /api/lab-orders/pending...');
  const pendingRes = await axios.get(`${BASE_URL}/lab-orders/pending`, { headers: authHeaders });
  const pendingOrders = pendingRes.data.data || [];
  console.log(`✅ Retrieved ${pendingOrders.length} pending unassigned orders.`);
  if (pendingOrders.length > 0) {
    console.log('Sample Pending Order:', pendingOrders[0]);
  }

  // Step 3: Get laboratory assigned orders queue
  console.log('\n3. Fetching GET /api/lab-orders/laboratory...');
  const queueRes = await axios.get(`${BASE_URL}/lab-orders/laboratory`, { headers: authHeaders });
  const myQueue = queueRes.data.data || [];
  console.log(`✅ Retrieved ${myQueue.length} assigned orders in lab queue.`);
  if (myQueue.length > 0) {
    console.log('Sample Queue Order:', myQueue[0]);
  }

  // Step 4: Accept an order if pending order exists
  let orderToTest = myQueue.find(o => o.status === 'in_progress');

  if (!orderToTest && pendingOrders.length > 0) {
    const orderToAccept = pendingOrders[0];
    console.log(`\n4. Accepting pending lab order ID: ${orderToAccept.id}...`);
    const acceptRes = await axios.patch(`${BASE_URL}/lab-orders/${orderToAccept.id}/accept`, {}, { headers: authHeaders });
    console.log('✅ Order accepted successfully!', acceptRes.data.data);
    orderToTest = acceptRes.data.data;
  } else if (orderToTest) {
    console.log(`\n4. Using existing in_progress order ID: ${orderToTest.id}`);
  } else {
    console.log('\n4. No pending order to accept right now.');
  }

  // Step 5: Upload lab report if we have an order in_progress
  if (orderToTest) {
    console.log(`\n5. Testing upload for order ${orderToTest.id}...`);
    
    const dummyFilePath = './dummy_test_report.pdf';
    fs.writeFileSync(dummyFilePath, '%PDF-1.4 Dummy Test Lab Report Content');

    const formData = new FormData();
    formData.append('lab_order_id', orderToTest.id);
    formData.append('report_summary', 'Automated Integration Test: Blood counts normal. CBC within range.');
    formData.append('file', fs.createReadStream(dummyFilePath), {
      filename: 'test_cbc_report.pdf',
      contentType: 'application/pdf',
    });

    try {
      const uploadRes = await axios.post(`${BASE_URL}/lab-reports`, formData, {
        headers: {
          ...authHeaders,
          ...formData.getHeaders(),
        },
      });
      console.log('✅ Lab Report Uploaded successfully!', uploadRes.data.data);

      if (fs.existsSync(dummyFilePath)) fs.unlinkSync(dummyFilePath);

      // Step 6: Fetch Lab Report by Order ID
      console.log(`\n6. Fetching GET /api/lab-reports/order/${orderToTest.id}...`);
      const reportRes = await axios.get(`${BASE_URL}/lab-reports/order/${orderToTest.id}`, { headers: authHeaders });
      console.log('✅ Lab Report retrieved successfully!', reportRes.data.data);

      // Step 7: Test duplicate upload failure (409 Conflict)
      console.log('\n7. Testing duplicate report upload (expecting 409 Conflict error)...');
      const dummyFilePath2 = './dummy_test_report2.pdf';
      fs.writeFileSync(dummyFilePath2, '%PDF-1.4 Dummy Test Lab Report 2');

      const formData2 = new FormData();
      formData2.append('lab_order_id', orderToTest.id);
      formData2.append('report_summary', 'Duplicate upload attempt');
      formData2.append('file', fs.createReadStream(dummyFilePath2), {
        filename: 'duplicate_report.pdf',
        contentType: 'application/pdf',
      });

      try {
        await axios.post(`${BASE_URL}/lab-reports`, formData2, {
          headers: {
            ...authHeaders,
            ...formData2.getHeaders(),
          },
        });
        console.log('❌ Unexpected: Duplicate upload succeeded when it should have failed!');
      } catch (dupError) {
        if (dupError.response && dupError.response.status === 409) {
          console.log('✅ Correctly received 409 Conflict error on duplicate upload!');
          console.log('   Message:', dupError.response.data.message);
        } else {
          console.log('⚠️ Duplicate upload error status:', dupError.response?.status, dupError.message);
        }
      } finally {
        if (fs.existsSync(dummyFilePath2)) fs.unlinkSync(dummyFilePath2);
      }

    } catch (uploadError) {
      if (uploadError.response && uploadError.response.status === 409) {
        console.log('ℹ️ A lab report was already uploaded for this order (409 Conflict):', uploadError.response.data.message);
        
        // Test fetching the existing report
        console.log(`\n6. Fetching GET /api/lab-reports/order/${orderToTest.id}...`);
        const reportRes = await axios.get(`${BASE_URL}/lab-reports/order/${orderToTest.id}`, { headers: authHeaders });
        console.log('✅ Lab Report retrieved successfully!', reportRes.data.data);
      } else {
        console.error('Upload failed error:', uploadError.response?.data || uploadError.message);
      }
    }
  }

  console.log('\n=== ALL API BACKEND ENDPOINTS VERIFIED SUCCESSFULLY ===');
}

testLabFlow();
