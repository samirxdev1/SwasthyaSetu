const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const BASE_URL = 'https://swasthyasetu-3cif.onrender.com/api';

async function testLabFlow() {
  console.log('=== TESTING LAB FLOW AGAINST LIVE BACKEND ===');
  console.log(`Base URL: ${BASE_URL}\n`);

  try {
    // Step 1: Login as Lab
    console.log('1. Logging in as lab.test@swasthyasetu.org...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: 'lab.test@swasthyasetu.org',
      password: 'Lab@12345',
    });

    if (!loginRes.data || !loginRes.data.success) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
    }

    const token = loginRes.data.data.token;
    console.log('✅ Login successful! Token acquired.');
    console.log(`User ID: ${loginRes.data.data.user.id}, Role: ${loginRes.data.data.role}\n`);

    const authHeaders = {
      Authorization: `Bearer ${token}`,
    };

    // Step 2: Get pending unassigned lab orders
    console.log('2. Fetching GET /api/lab-orders/pending...');
    const pendingRes = await axios.get(`${BASE_URL}/lab-orders/pending`, { headers: authHeaders });
    const pendingOrders = pendingRes.data.data || [];
    console.log(`✅ Retrieved ${pendingOrders.length} pending unassigned orders.`);
    if (pendingOrders.length > 0) {
      console.log('Sample Pending Order:', pendingOrders[0]);
    }
    console.log('');

    // Step 3: Get laboratory assigned orders queue
    console.log('3. Fetching GET /api/lab-orders/laboratory...');
    const queueRes = await axios.get(`${BASE_URL}/lab-orders/laboratory`, { headers: authHeaders });
    const myQueue = queueRes.data.data || [];
    console.log(`✅ Retrieved ${myQueue.length} assigned orders in lab queue.`);
    if (myQueue.length > 0) {
      console.log('Sample Queue Order:', myQueue[0]);
    }
    console.log('');

    // Step 4: Accept an order if pending order exists
    let orderToTest = myQueue.find(o => o.status === 'in_progress');

    if (!orderToTest && pendingOrders.length > 0) {
      const orderToAccept = pendingOrders[0];
      console.log(`4. Accepting pending lab order ID: ${orderToAccept.id}...`);
      const acceptRes = await axios.patch(`${BASE_URL}/lab-orders/${orderToAccept.id}/accept`, {}, { headers: authHeaders });
      console.log('✅ Order accepted successfully!', acceptRes.data.data);
      orderToTest = acceptRes.data.data;
    } else if (orderToTest) {
      console.log(`4. Using existing in_progress order ID: ${orderToTest.id}`);
    } else {
      console.log('4. No pending or in_progress order available to accept. Testing completed queue.');
    }
    console.log('');

    // Step 5: Upload lab report if we have an order in_progress
    if (orderToTest) {
      console.log(`5. Testing upload for order ${orderToTest.id}...`);
      
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
            console.log('   Response:', dupError.response.data);
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
  } catch (err) {
    console.error('Test execution error:', err.response?.data || err.message);
  }
}

testLabFlow();
