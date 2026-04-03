// THIS FILE HANDLES ALL API REQUESTS - PUT THIS IN /api/list.js
const fs = require('fs');
const path = require('path');

// Password from environment variable (set in Vercel dashboard)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'karah123';

module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Password');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  const scriptName = req.url.slice(1); // get filename after /api/
  const scriptsDir = path.join(process.cwd(), 'api');
  
  // GET /api/ - list all scripts
  if (req.method === 'GET' && !scriptName) {
    try {
      const files = fs.readdirSync(scriptsDir).filter(f => f !== 'list.js' && !f.endsWith('.json'));
      res.status(200).json(files);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }
  
  // GET /api/filename - raw script content (public)
  if (req.method === 'GET' && scriptName) {
    try {
      const filePath = path.join(scriptsDir, scriptName);
      if (!fs.existsSync(filePath) || scriptName === 'list.js') {
        res.status(404).send('Script not found');
        return;
      }
      const content = fs.readFileSync(filePath, 'utf8');
      res.setHeader('Content-Type', 'text/plain');
      res.status(200).send(content);
    } catch (err) {
      res.status(500).send(err.message);
    }
    return;
  }
  
  // Check password for PUT/DELETE
  const password = req.headers['x-password'];
  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }
  
  // PUT /api/filename - create/update script (admin)
  if (req.method === 'PUT' && scriptName) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const filePath = path.join(scriptsDir, scriptName);
        if (scriptName === 'list.js' || scriptName.includes('..')) {
          res.status(400).json({ error: 'Invalid filename' });
          return;
        }
        fs.writeFileSync(filePath, body, 'utf8');
        res.status(200).json({ success: true, file: scriptName });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
    return;
  }
  
  // DELETE /api/filename - delete script (admin)
  if (req.method === 'DELETE' && scriptName) {
    try {
      const filePath = path.join(scriptsDir, scriptName);
      if (!fs.existsSync(filePath) || scriptName === 'list.js') {
        res.status(404).json({ error: 'Script not found' });
        return;
      }
      fs.unlinkSync(filePath);
      res.status(200).json({ success: true, deleted: scriptName });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }
  
  res.status(405).json({ error: 'Method not allowed' });
};
