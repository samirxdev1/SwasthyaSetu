const http = require('http');
const https = require('https');

const endpoints = [
  { host: '127.0.0.1', port: 8004, path: '/mfs100/info', protocol: 'http' },
  { host: 'localhost', port: 8004, path: '/mfs100/info', protocol: 'http' },
  { host: '127.0.0.1', port: 8003, path: '/mfs100/info', protocol: 'https' },
  { host: 'localhost', port: 8003, path: '/mfs100/info', protocol: 'https' },
  { host: '127.0.0.1', port: 11100, path: '/rd/info', protocol: 'http' },
  { host: '127.0.0.1', port: 11101, path: '/rd/info', protocol: 'https' },
];

function testEndpoint(ep) {
  const urlStr = `${ep.protocol}://${ep.host}:${ep.port}${ep.path}`;
  return new Promise((resolve) => {
    const mod = ep.protocol === 'https' ? https : http;
    const req = mod.get({
      host: ep.host,
      port: ep.port,
      path: ep.path,
      rejectUnauthorized: false,
      timeout: 2000,
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`[RESULT] ${urlStr} | REACHABLE | HTTP ${res.statusCode} | ${body.trim().slice(0, 100)}`);
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`[RESULT] ${urlStr} | UNREACHABLE | Code: ${err.code || 'UNKNOWN'} | Msg: ${err.message}`);
      resolve();
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`[RESULT] ${urlStr} | TIMEOUT | No response within 2000ms`);
      resolve();
    });
  });
}

async function main() {
  console.log('=== STARTING MANTRA PROBE ===');
  for (const ep of endpoints) {
    await testEndpoint(ep);
  }
  console.log('=== END MANTRA PROBE ===');
}

main();

