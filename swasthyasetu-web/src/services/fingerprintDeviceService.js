/**
 * fingerprintDeviceService.js — Communicates directly from the browser to the local
 * Windows Mantra MFS100 Client Service / RD Service REST interface to trigger hardware capture.
 */

export const MANTRA_CONFIGURED_ENDPOINT = {
  url: 'http://localhost:8004/mfs100/capture',
  infoUrl: 'http://localhost:8004/mfs100/info',
  type: 'mfs100',
};

export const LOCAL_MANTRA_ENDPOINTS = [
  MANTRA_CONFIGURED_ENDPOINT,
  { url: 'https://localhost:8003/mfs100/capture', infoUrl: 'https://localhost:8003/mfs100/info', type: 'mfs100' },
  { url: 'http://127.0.0.1:8004/mfs100/capture', infoUrl: 'http://127.0.0.1:8004/mfs100/info', type: 'mfs100' },
  { url: 'http://localhost:11100/rd/capture', infoUrl: 'http://localhost:11100/rd/info', type: 'rd' },
  { url: 'https://localhost:11101/rd/capture', infoUrl: 'https://localhost:11101/rd/info', type: 'rd' },
];

/**
 * Executes fetch with a configurable timeout (default 4 seconds).
 */
const fetchWithTimeout = async (url, options = {}, timeoutMs = 4000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

/**
 * TASK 3 — Pre-Flight Health Check with Clear Diagnostics
 * Classifies exact failure mode:
 * - 'SERVICE_RUNNING' (Endpoint responded HTTP 200)
 * - 'CERTIFICATE_NOT_TRUSTED' (HTTPS endpoint failed due to SSL cert / CORS block)
 * - 'SERVICE_NOT_RUNNING' (Connection actively refused on all ports)
 */
export const performPreflightHealthCheck = async () => {
  console.log('🩺 Running Mantra Pre-Flight Health Check...');
  const probeResults = [];
  let certIssueDetected = false;

  for (const ep of LOCAL_MANTRA_ENDPOINTS) {
    try {
      const res = await fetchWithTimeout(ep.infoUrl, { method: 'GET' }, 2500);
      if (res.ok) {
        let data = null;
        try {
          data = await res.json();
        } catch {
          data = await res.text();
        }
        console.log(`✅ Pre-flight check SUCCESS on ${ep.infoUrl}:`, data);
        return {
          status: 'SERVICE_RUNNING',
          activeEndpoint: ep,
          message: 'Mantra Client Service is running and reachable.',
          data,
          details: probeResults,
        };
      } else {
        probeResults.push({ url: ep.infoUrl, status: res.status, ok: false });
      }
    } catch (err) {
      probeResults.push({
        url: ep.infoUrl,
        name: err.name,
        message: err.message,
        isHttps: ep.infoUrl.startsWith('https:'),
      });

      if (ep.infoUrl.startsWith('https:')) {
        certIssueDetected = true;
      }
    }
  }

  if (certIssueDetected) {
    return {
      status: 'CERTIFICATE_NOT_TRUSTED',
      message: 'Certificate not trusted or blocked by browser security.',
      httpsUrl: 'https://localhost:8003/mfs100/info',
      details: probeResults,
    };
  }

  return {
    status: 'SERVICE_NOT_RUNNING',
    message: 'Mantra service not running or scanner disconnected.',
    details: probeResults,
  };
};

/**
 * TASK 4 — Triggers hardware capture starting with confirmed endpoint.
 */
export const captureFingerprint = async (options = { allowDemoFallback: false }) => {
  const attemptedErrors = [];

  for (const ep of LOCAL_MANTRA_ENDPOINTS) {
    try {
      console.log(`👉 Attempting Mantra capture at: ${ep.url}`);
      const payload = ep.type === 'mfs100'
        ? JSON.stringify({ Quality: 60, TimeOut: 10 })
        : '<PidOptions ver="1.0"><Opts fCount="1" fType="2" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="10000" otp="" pos="UNKNOWN" env="P"/></PidOptions>';

      const headers = ep.type === 'mfs100'
        ? { 'Content-Type': 'application/json' }
        : { 'Content-Type': 'text/xml' };

      const response = await fetchWithTimeout(ep.url, {
        method: 'POST',
        headers,
        body: payload,
      }, 5000);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        const httpErr = new Error(`HTTP ${response.status} from ${ep.url}: ${errorText}`);
        attemptedErrors.push({ url: ep.url, error: httpErr.message });
        continue;
      }

      if (ep.type === 'mfs100') {
        const data = await response.json();
        console.log(`📥 Mantra raw response from ${ep.url}:`, data);

        if (data.ErrorCode === 0 || data.ErrorCode === '0') {
          const template = data.IsoTemplate || data.AnsiTemplate;
          if (template) {
            return {
              templateData: template,
              qualityScore: data.Quality || 70,
              bitmapData: data.BitmapData || null,
              rawResponse: data,
            };
          }
        } else {
          const hwError = new Error(`Mantra Hardware Error [Code ${data.ErrorCode}]: ${data.ErrorDescription || 'Unknown device error'}`);
          hwError.errorCode = data.ErrorCode;
          hwError.errorDescription = data.ErrorDescription;
          attemptedErrors.push({ url: ep.url, error: hwError.message, data });
          throw hwError;
        }
      } else {
        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        const respNode = xmlDoc.querySelector('Resp');
        const errCode = respNode?.getAttribute('errCode');
        const errInfo = respNode?.getAttribute('errInfo');

        if (errCode === '0') {
          const dataNode = xmlDoc.querySelector('Data');
          const template = dataNode?.textContent?.trim();
          if (template) {
            return {
              templateData: template,
              qualityScore: 75,
              rawXml: text,
            };
          }
        } else {
          const rdErr = new Error(`Mantra RD Service Error [errCode ${errCode}]: ${errInfo || 'RD Service failure'}`);
          attemptedErrors.push({ url: ep.url, error: rdErr.message });
          throw rdErr;
        }
      }
    } catch (err) {
      if (err.message && (err.message.includes('Mantra Hardware Error') || err.message.includes('Mantra RD Service Error'))) {
        throw err;
      }

      attemptedErrors.push({
        url: ep.url,
        name: err.name,
        message: err.message,
        type: err.name === 'AbortError' ? 'Timeout' : 'Network/CORS/SSL Error',
      });
    }
  }

  // Pre-flight check to classify exact error for UI
  const healthCheck = await performPreflightHealthCheck();

  if (options && options.allowDemoFallback) {
    console.info('ℹ️ Hardware service offline. Demo fallback activated.');
    const mockIsoHeader = 'Rk1SADAyMAAAAAAAARgAMgAyAABAAAAAAA';
    const sampleMinutiae = 'FA0ABgAHAAgACQAKAAsADAAOAA8AEAAREBI';
    return {
      templateData: `${mockIsoHeader}${sampleMinutiae}${Date.now().toString(36)}`,
      qualityScore: 85,
      isDemoMock: true,
      healthCheck,
    };
  }

  const rawDiagnosticError = new Error(
    healthCheck.status === 'CERTIFICATE_NOT_TRUSTED'
      ? 'Certificate Not Trusted: Please open https://localhost:8003/mfs100/info in a new tab and accept the security certificate.'
      : 'Mantra Service Not Running: Please ensure MFS100ClientService is started and USB scanner is connected.'
  );
  rawDiagnosticError.healthCheck = healthCheck;
  rawDiagnosticError.attemptedErrors = attemptedErrors;

  throw rawDiagnosticError;
};

export default {
  captureFingerprint,
  performPreflightHealthCheck,
  LOCAL_MANTRA_ENDPOINTS,
};
