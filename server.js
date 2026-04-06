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
app.use(express.static('.'));

// Get all scripts
app.get('/api/scripts', (req, res) => {
  const data = readData();
  const scripts = data.scripts.map(s => ({
    id: s.id,
    title: s.title,
    created_at: s.created_at
  }));
  res.json(scripts);
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

// Delete script
app.delete('/api/delete', (req, res) => {
  const { id } = req.body;
  const data = readData();
  data.scripts = data.scripts.filter(s => s.id !== id);
  writeData(data);
  res.json({ success: true });
});

// Raw script for Roblox executors
app.get('/api/raw', (req, res) => {
  const { id } = req.query;
  const data = readData();
  const script = data.scripts.find(s => s.id == id);
  
  if (!script) {
    return res.status(404).send('Script not found');
  }
  
  res.setHeader('Content-Type', 'text/plain');
  res.send(script.content);
});

// Blocked endpoint
app.get('/api/script', (req, res) => {
  const { id } = req.query;
  const data = readData();
  const script = data.scripts.find(s => s.id == id);
  
  if (!script) {
    return res.status(404).send('Not found');
  }
  
  res.status(403).send(`
    <!DOCTYPE html>
    <html>
    <head><style>body{background:black;display:flex;align-items:center;justify-content:center;height:100vh;color:red;font-family:monospace;}</style></head>
    <body><div><h1>⛔ ACCESS PROHIBITED jew</h1><p>Use /api/raw?id=${id} for Roblox executor.</p></div></body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
