const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON file as database
const DATA_FILE = path.join(__dirname, 'scripts.json');

// Initialize file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ nextId: 1, scripts: [] }));
}

function readData() {
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.use(express.json());
app.use(express.static(__dirname));

// ============= API ROUTES =============

// Get all scripts
app.get('/api/scripts', (req, res) => {
  const data = readData();
  const scripts = data.scripts.map(s => ({
    id: s.id,
    title: s.title,
    content: s.content,
    created_at: s.created_at
  }));
  res.json(scripts);
});

// Get single script by ID
app.get('/api/script/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const data = readData();
  const script = data.scripts.find(s => s.id === id);
  
  if (!script) {
    return res.status(404).json({ error: 'Script not found' });
  }
  
  res.json(script);
});

// Upload script
app.post('/api/upload', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Missing title or content' });
  }
  
  const data = readData();
  const newScript = {
    id: data.nextId,
    title: title,
    content: content,
    created_at: new Date().toISOString()
  };
  
  data.scripts.push(newScript);
  data.nextId++;
  writeData(data);
  
  res.json({ success: true, id: newScript.id });
});

// Update script (EDIT)
app.put('/api/update/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Missing title or content' });
  }
  
  const data = readData();
  const scriptIndex = data.scripts.findIndex(s => s.id === id);
  
  if (scriptIndex === -1) {
    return res.status(404).json({ error: 'Script not found' });
  }
  
  data.scripts[scriptIndex].title = title;
  data.scripts[scriptIndex].content = content;
  writeData(data);
  
  res.json({ success: true, message: 'Script updated!' });
});

// Delete script
app.delete('/api/delete/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const data = readData();
  data.scripts = data.scripts.filter(s => s.id !== id);
  writeData(data);
  res.json({ success: true });
});

// RAW script for Roblox executors (UNBLOCKED - works!)
app.get('/api/raw', (req, res) => {
  const { id } = req.query;
  const data = readData();
  const script = data.scripts.find(s => s.id == id);
  
  if (!script) {
    return res.status(404).send('-- Script not found');
  }
  
  // Return pure Lua - NO HTML, NO black screen
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(script.content);
});

// BLOCKED endpoint - BLACK SCREEN for browsers
app.get('/api/script', (req, res) => {
  const { id } = req.query;
  const data = readData();
  const script = data.scripts.find(s => s.id == id);
  
  // Always show black screen, even if script doesn't exist
  res.setHeader('Content-Type', 'text/html');
  res.status(403).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Access Denied</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-family: 'Courier New', monospace;
          overflow: hidden;
        }
        .block-screen {
          text-align: center;
          color: #ff0000;
          background: #0a0000;
          padding: 2rem;
          border: 2px solid #ff0000;
          border-radius: 1rem;
          box-shadow: 0 0 50px rgba(255,0,0,0.3);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; box-shadow: 0 0 80px rgba(255,0,0,0.5); }
          100% { opacity: 0.8; }
        }
        .block-screen h1 { font-size: 2rem; margin-bottom: 1rem; }
        .block-screen p { color: #aa0000; font-size: 0.9rem; margin: 0.5rem 0; }
        .block-screen .id { color: #ff4444; font-family: monospace; }
        .block-screen small { color: #550000; display: block; margin-top: 1rem; }
      </style>
    </head>
    <body>
      <div class="block-screen">
        <h1>⛔ ACCESS PROHIBITED</h1>
        <p>This endpoint is blocked for browser access.</p>
        <p>Use <span class="id">/api/raw?id=${id || 'X'}</span> for Roblox executor.</p>
        <small>Request blocked • Script Vault Security</small>
      </div>
    </body>
    </html>
  `);
});

// Serve admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/', (req, res) => {
  res.redirect('/admin');
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`📜 Raw script: http://localhost:${PORT}/api/raw?id=1`);
  console.log(`🚫 Blocked: http://localhost:${PORT}/api/script?id=1`);
});
