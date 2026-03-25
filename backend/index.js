import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Set up multer for processing multipart/form-data with an image
const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.send('Floater Backend API is running...');
});

// New endpoint to process receipt OCR via python child process
app.post('/api/ocr', upload.single('receipt'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided. Please upload an image field named "receipt".' });
  }

  const imagePath = req.file.path;
  const pythonScript = path.join(__dirname, 'python_ocr', 'main.py');

  // Spawn the python process
  execFile('python', [pythonScript, imagePath], (error, stdout, stderr) => {
    // Clean up temporary image
    fs.unlink(imagePath, (unlinkErr) => {
      if (unlinkErr) console.error('Failed to delete temp image file:', unlinkErr);
    });

    if (error) {
      console.error('OCR Process failed:', error);
      console.error('OCR STDERR:', stderr);
      return res.status(500).json({ error: 'OCR Processing failed.' });
    }

    try {
        // Parse the JSON string emitted by python directly into an object
        const result = JSON.parse(stdout.trim());
        res.json(result);
    } catch (parseErr) {
        console.error('Failed to parse Python Output:', parseErr);
        console.error('Raw Output:', stdout);
        res.status(500).json({ error: 'Invalid OCR response format.' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
