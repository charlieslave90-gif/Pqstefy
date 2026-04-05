// =============================================================
// FILE: /api/script.js (BLOCKED endpoint - shows black screen)
// =============================================================

const db = require('./db');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).send('Missing or invalid ?id parameter');
  }

  try {
    const result = await db.query('SELECT id FROM scripts WHERE id = $1', [parseInt(id)]);
    
    if (result.rows.length === 0) {
      return res.status(404).send('Script not found');
    }
    
    // BLACK SCREEN OF DEATH - Blocks any browser access
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Roblox-Access-Denied', 'true');
    return res.status(403).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
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
          .block-screen p { color: #aa0000; font-size: 0.9rem; }
          .block-screen small { color: #550000; display: block; margin-top: 1rem; }
        </style>
      </head>
      <body>
        <div class="block-screen">
          <h1>⛔ No skidding sad</h1>
          <p>This endpoint is blocked for browser access.</p>
          <p>Use /api/raw?id=${id} for Roblox executor.</p>
          <small>Request blocked • Script Vault Security System</small>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Block endpoint error:', error);
    return res.status(500).send('Internal server error');
  }
}
