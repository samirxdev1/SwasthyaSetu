import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const downloadApk = (req, res) => {
  const filePath = path.join(__dirname, '/assets', 'SwasthyaSetu.apk');
  res.download(filePath, 'SwasthyaSetu.apk', (err) => {
    if (err) {
      console.log("Download failed:", err);
      if (!res.headersSent) {
        res.status(404).send('File not found.');
      }
    }
  });
};
