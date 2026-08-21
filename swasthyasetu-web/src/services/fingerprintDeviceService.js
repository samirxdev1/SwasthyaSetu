/**
 * fingerprintDeviceService.js — Communicates directly from the browser to the local
 * Windows Mantra MFS100 Client Service / RD Service REST interface to trigger hardware capture.
 */

const LOCAL_MANTRA_ENDPOINTS = [
  { url: 'http://localhost:8004/mfs100/capture', type: 'mfs100' },
  { url: 'https://localhost:8003/mfs100/capture', type: 'mfs100' },
  { url: 'http://127.0.0.1:8004/mfs100/capture', type: 'mfs100' },
  { url: 'http://localhost:11100/rd/capture', type: 'rd' },
  { url: 'https://localhost:11101/rd/capture', type: 'rd' },
];

/**
 * Executes fetch with a configurable timeout (default 8 seconds).
 */
const fetchWithTimeout = async (url, options = {}, timeoutMs = 8000) => {
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
 * Triggers hardware capture on the local Mantra MFS100 scanner service.
 * @returns {Promise<{templateData: string, qualityScore: number, bitmapData?: string}>}
 */
export const captureFingerprint = async () => {
  let lastError = null;

  for (const ep of LOCAL_MANTRA_ENDPOINTS) {
    try {
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
      }, 10000);

      if (!response.ok) {
        continue;
      }

      if (ep.type === 'mfs100') {
        const data = await response.json();
        if (data.ErrorCode === 0 || data.ErrorCode === '0') {
          const template = data.IsoTemplate || data.AnsiTemplate;
          if (template) {
            return {
              templateData: template,
              qualityScore: data.Quality || 70,
              bitmapData: data.BitmapData || null,
            };
          }
        } else if (data.ErrorDescription) {
          throw new Error(`Mantra Hardware Error: ${data.ErrorDescription}`);
        }
      } else {
        // RD Service XML response handling
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
            };
          }
        } else if (errInfo) {
          throw new Error(`RD Service Error: ${errInfo}`);
        }
      }
    } catch (err) {
      if (err.message && (err.message.includes('Mantra Hardware Error') || err.message.includes('RD Service Error'))) {
        throw err;
      }
      lastError = err;
    }
  }

  // If all ports/endpoints fail to connect
  console.warn('Local Mantra MFS100 service check failed:', lastError?.message);
  const error = new Error('Mantra fingerprint scanner service not detected. Please ensure the device is connected and MFS100ClientService is running.');
  error.isDeviceMissing = true;
  throw error;
};

export default {
  captureFingerprint,
};
