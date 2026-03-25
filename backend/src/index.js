import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { execFile } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { scoreAllObligations } from './scoring.js';
import { relationshipEngine } from './relationshipEngine.js';
import { NegotiationEngine } from './negotiationEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Promisify execFile for async/await usage
const execFilePromise = promisify(execFile);

// Initialize Engines
const negotEngine = new NegotiationEngine(relationshipEngine);

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const isDummy = !supabaseUrl || supabaseUrl.includes('dummy') || !supabaseKey || supabaseKey.startsWith('your_');
const supabase = createClient(supabaseUrl || 'https://dummy.supabase.co', supabaseKey || 'dummy');

app.use(cors());
app.use(express.json());

// Sync relationships from DB before returning them
async function syncUserRelationships(userId) {
  console.log(`📡 Resetting & Syncing relationships for user: ${userId} (Dummy: ${isDummy})`);
  relationshipEngine.clear();

  if (isDummy || !userId || userId === 'mock-user') {
    relationshipEngine.updateRelationship("ABC Suppliers", 10000, true);
    relationshipEngine.updateRelationship("Global Logistics", 5000, false, true);
    relationshipEngine.updateRelationship("Cloud Hosting", 1200, true);
    relationshipEngine.updateRelationship("City Properties", 25000, false, true);
    return;
  }

  try {
     const { data: txs, error: txError } = await supabase
       .from('transactions')
       .select('*')
       .eq('user_id', userId)
       .eq('type', 'expense');

     if (txError) throw txError;

     const { data: obligations, error: obError } = await supabase
       .from('obligations')
       .select('*')
       .eq('user_id', userId);

     if (obError) throw obError;

     txs?.forEach(tx => {
        const vendorName = tx.description.split(' (')[0] || 'Unknown Vendor';
        relationshipEngine.updateRelationship(vendorName, tx.amount, true, false);
     });

     obligations?.forEach(ob => {
        const isOverdue = new Date(ob.due_date) < new Date();
        relationshipEngine.updateRelationship(ob.name, ob.amount, !isOverdue, isOverdue);
     });

     console.log(`✅ Synced ${txs?.length || 0} transactions and ${obligations?.length || 0} obligations.`);
  } catch (err) {
     console.error('❌ Failed to sync relationships from DB:', err);
  }
}

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

app.get('/', (req, res) => {
  res.send('Floater Backend API is running...');
});

app.get('/api/relationships', async (req, res) => {
  const { userId } = req.query;
  await syncUserRelationships(userId);
  res.json({ success: true, relationships: relationshipEngine.vendors });
});

app.post('/api/ocr', upload.single('receipt'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file provided.' });

  const imagePath = req.file.path;
  const pythonScript = path.join(__dirname, '..', 'python', 'ocr', 'main.py');

  execFile('python', [pythonScript, imagePath], (error, stdout, stderr) => {
    fs.unlink(imagePath, (unlinkErr) => { if (unlinkErr) console.error(unlinkErr); });

    if (error) return res.status(500).json({ error: 'OCR Processing failed.' });

    try {
        const result = JSON.parse(stdout.trim());
        res.json(result);
    } catch (parseErr) {
        res.status(500).json({ error: 'Invalid OCR response format.' });
    }
  });
});

app.post('/api/score', (req, res) => {
  const { balance, obligations } = req.body;
  
  if (balance === undefined || !Array.isArray(obligations)) {
    return res.status(400).json({ error: 'Invalid input.' });
  }

  try {
    const sortedObligations = scoreAllObligations(balance, obligations);
    res.json({ success: true, scored_obligations: sortedObligations });
  } catch (err) {
    res.status(500).json({ error: 'Scoring failed.' });
  }
});

app.post('/api/negotiate', async (req, res) => {
  const { transaction, decision, userId } = req.body;

  if (!transaction || !decision) {
     return res.status(400).json({ error: 'Missing data.' });
  }

  try {
     await syncUserRelationships(userId);
     const plan = negotEngine.generatePlan(transaction, decision);
     const emailInput = negotEngine.prepareEmailInput(plan);
     res.json({ success: true, plan, email_prompt_data: emailInput });
  } catch (err) {
     res.status(500).json({ error: 'Negotiation failed.' });
  }
});

import { spawn } from 'child_process';

app.post('/api/generate-email', async (req, res) => {
  const { vendor_name, amount, due_date, mode, strategy } = req.body;

  if (!vendor_name) return res.status(400).json({ error: 'Missing vendor name.' });

  const scriptPath = path.join(__dirname, '..', 'python', 'generator', 'mail_cli.py');
  const inputData = JSON.stringify({ vendor_name, amount, due_date, mode, strategy });

  try {
     const pythonProcess = spawn('python', [scriptPath]);
     let stdoutData = '';
     let stderrData = '';

     pythonProcess.stdin.write(inputData);
     pythonProcess.stdin.end();

     pythonProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
     });

     pythonProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
     });

     pythonProcess.on('close', (code) => {
        if (code !== 0) {
           console.error('Python Error (spawn code !== 0):', stderrData);
           return res.status(500).json({ error: 'AI script failed.' });
        }

        try {
           const result = JSON.parse(stdoutData.trim());
           if (result.success) {
              res.json({ success: true, email: result.email });
           } else {
              res.status(500).json({ error: result.error });
           }
        } catch (err) {
           console.error('JSON parse error from python STDOUT:', err, stdoutData);
           res.status(500).json({ error: 'Failed to process AI response.' });
        }
     });

  } catch (err) {
    console.error('Execution setup error:', err);
    res.status(500).json({ error: 'AI generation engine failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
