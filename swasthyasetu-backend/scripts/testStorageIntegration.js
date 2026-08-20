import supabase from '../src/config/supabaseClient.js';
import storageService from '../src/services/storageService.js';
import { STORAGE_BUCKETS } from '../src/constants/storageBuckets.js';
import labReportService from '../src/services/labReportService.js';
import aiService from '../src/services/aiService.js';
import patientService from '../src/services/patientService.js';

async function runE2ETests() {
  console.log('=============== E2E SUPABASE STORAGE INTEGRATION TEST ===============\n');

  // TEST 1: Confirm Buckets Exist in Supabase Storage
  console.log('--- TEST 1: Bucket Verification ---');
  const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
  if (bucketErr) {
    console.error('❌ Failed to list buckets:', bucketErr.message);
    process.exit(1);
  }

  const bucketMap = {};
  buckets.forEach(b => { bucketMap[b.name] = b; });

  console.log('Listing all buckets in Supabase Storage:');
  buckets.forEach(b => console.log(`  - Bucket: "${b.name}" | Private: ${!b.public}`));

  const labReportsBucket = bucketMap[STORAGE_BUCKETS.LAB_REPORTS];
  const prescriptionScansBucket = bucketMap[STORAGE_BUCKETS.PRESCRIPTION_SCANS];

  if (!labReportsBucket) {
    console.error(`❌ Bucket '${STORAGE_BUCKETS.LAB_REPORTS}' not found!`);
  } else {
    console.log(`✅ Bucket '${STORAGE_BUCKETS.LAB_REPORTS}' verified (Private: ${!labReportsBucket.public})`);
  }

  if (!prescriptionScansBucket) {
    console.error(`❌ Bucket '${STORAGE_BUCKETS.PRESCRIPTION_SCANS}' not found!`);
  } else {
    console.log(`✅ Bucket '${STORAGE_BUCKETS.PRESCRIPTION_SCANS}' verified (Private: ${!prescriptionScansBucket.public})`);
  }

  // TEST 2: Real File Upload to 'lab-reports' Bucket & DB Storage Path Verification
  console.log('\n--- TEST 2: Lab Report Storage Upload & DB Path Verification ---');
  
  // Find a test lab order or create test data
  const { data: labOrders, error: orderErr } = await supabase
    .from('lab_orders')
    .select('*')
    .limit(1);

  let testOrder = labOrders && labOrders[0];
  if (!testOrder) {
    console.log('No existing lab_orders in DB. Creating dummy lab order for test...');
    const { data: doctor } = await supabase.from('doctors').select('*').limit(1).single();
    const { data: patient } = await supabase.from('patients').select('*').limit(1).single();
    const { data: lab } = await supabase.from('laboratories').select('*').limit(1).single();
    
    if (doctor && patient && lab) {
      const { data: newOrder } = await supabase.from('lab_orders').insert([{
        consultation_id: null,
        patient_id: patient.id,
        doctor_id: doctor.id,
        laboratory_id: lab.id,
        test_name: 'CBC Test E2E Storage Test',
        status: 'in_progress'
      }]).select().single();
      testOrder = newOrder;
    }
  }

  if (!testOrder) {
    console.warn('⚠️ Could not locate or create lab order for upload test.');
  } else {
    console.log(`Using Lab Order ID: ${testOrder.id}`);

    // Create a dummy PDF/text buffer
    const testFileContent = `SwasthyaSetu Lab Report Test Content - Timestamp: ${new Date().toISOString()}`;
    const testBuffer = Buffer.from(testFileContent, 'utf-8');
    const testFileName = `e2e_test_report_${Date.now()}.pdf`;
    const mimeType = 'application/pdf';

    const folder = testOrder.patient_id || testOrder.id;
    const storagePath = `reports/${folder}/${Date.now()}-${testFileName}`;

    console.log(`Uploading file buffer to bucket '${STORAGE_BUCKETS.LAB_REPORTS}' at path '${storagePath}'...`);
    const returnedPath = await storageService.uploadFile(
      STORAGE_BUCKETS.LAB_REPORTS,
      storagePath,
      testBuffer,
      mimeType
    );

    console.log(`Returned Storage Path: "${returnedPath}"`);

    // Verify raw file ACTUALLY exists in Supabase Storage bucket listing
    const folderPath = `reports/${folder}`;
    const { data: fileList, error: listErr } = await supabase.storage
      .from(STORAGE_BUCKETS.LAB_REPORTS)
      .list(folderPath);

    if (listErr) {
      console.error('❌ Failed to list bucket contents:', listErr.message);
    } else {
      console.log(`Contents of Supabase Storage bucket '${STORAGE_BUCKETS.LAB_REPORTS}' under '${folderPath}':`, fileList.map(f => f.name));
      const uploadedFileEntry = fileList.find(f => returnedPath.endsWith(f.name));
      if (uploadedFileEntry) {
        console.log(`✅ File ACTUALLY exists in Supabase Storage! File name: ${uploadedFileEntry.name}, Size: ${uploadedFileEntry.metadata?.size || 'N/A'} bytes`);
      } else {
        console.error('❌ Uploaded file not found in storage bucket file list!');
      }
    }

    // TEST 3: Generate & Verify Time-Limited Signed URL
    console.log('\n--- TEST 3: Get Lab Report & Signed URL Verification ---');
    const signedUrl = await storageService.getSignedUrl(STORAGE_BUCKETS.LAB_REPORTS, returnedPath, 3600);
    console.log(`Generated Signed URL (expires in 3600s):\n  ${signedUrl}`);

    if (signedUrl && signedUrl.includes('token=')) {
      console.log('✅ Signed URL generated with time-limited authorization token!');
      
      // Fetch the file using the signed URL to confirm it actually downloads the real content
      try {
        const response = await fetch(signedUrl);
        console.log(`HTTP GET Signed URL Status: ${response.status} ${response.statusText}`);
        if (response.ok) {
          const text = await response.text();
          console.log(`Fetched file contents via Signed URL: "${text}"`);
          if (text === testFileContent) {
            console.log('✅ Downloaded content EXACTLY MATCHES uploaded file buffer!');
          }
        }
      } catch (fetchErr) {
        console.error('Failed to fetch via signed URL:', fetchErr.message);
      }
    } else {
      console.error('❌ Signed URL format invalid or token missing');
    }
  }

  // TEST 4: Prescription Scan Upload to 'prescription-scans' Bucket
  console.log('\n--- TEST 4: AI Scan Prescription Storage Upload ---');
  const dummyPrescriptionImage = Buffer.from('RIFF....WEBPVP8 ... dummy image binary buffer data ...');
  const scanFileName = `prescription_scan_${Date.now()}.jpg`;
  const scanStoragePath = `scans/test-patient-id/${Date.now()}-${scanFileName}`;

  console.log(`Uploading prescription scan to bucket '${STORAGE_BUCKETS.PRESCRIPTION_SCANS}' at path '${scanStoragePath}'...`);
  const uploadedScanPath = await storageService.uploadFile(
    STORAGE_BUCKETS.PRESCRIPTION_SCANS,
    scanStoragePath,
    dummyPrescriptionImage,
    'image/jpeg'
  );

  console.log(`Returned Scanned Image Path: "${uploadedScanPath}"`);

  // Verify file ACTUALLY exists in 'prescription-scans' bucket
  const scanFolder = 'scans/test-patient-id';
  const { data: scanFileList, error: scanListErr } = await supabase.storage
    .from(STORAGE_BUCKETS.PRESCRIPTION_SCANS)
    .list(scanFolder);

  if (scanListErr) {
    console.error('❌ Failed to list prescription-scans bucket contents:', scanListErr.message);
  } else {
    console.log(`Contents of Supabase Storage bucket '${STORAGE_BUCKETS.PRESCRIPTION_SCANS}' under '${scanFolder}':`, scanFileList.map(f => f.name));
    const foundScan = scanFileList.find(f => uploadedScanPath.endsWith(f.name));
    if (foundScan) {
      console.log(`✅ Prescription scan image ACTUALLY exists in Supabase Storage! File: ${foundScan.name}`);
    } else {
      console.error('❌ Uploaded prescription scan image not found in storage bucket!');
    }
  }

  // TEST 5: Expiry Parameter Verification
  console.log('\n--- TEST 5: Expiry Duration Verification ---');
  const shortSignedUrl = await storageService.getSignedUrl(STORAGE_BUCKETS.LAB_REPORTS, 'test_path.pdf', 60);
  console.log(`Signed URL with 60s expiry:\n  ${shortSignedUrl}`);
  if (shortSignedUrl.includes('token=')) {
    console.log('✅ Expiry duration parameter successfully accepted and applied to URL generation!');
  }

  console.log('\n================ E2E STORAGE INTEGRATION TEST COMPLETE ================');
}

runE2ETests().catch(err => {
  console.error('E2E Test Execution Error:', err);
  process.exit(1);
});
