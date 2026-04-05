// =============================================================
// FILE: /api/raw.js (GET raw Lua - PUBLIC for Roblox executors)
// =============================================================

const db = require('./db');

export default async function handler(req, res) {
  // Allow CORS for Roblox executors
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Valid ?id= parameter required' });
  }

  try {
    const result = await db.query('SELECT content FROM scripts WHERE id = $1', [parseInt(id)]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Script not found' });
    }
    
    // Return raw Lua script with proper content-type for executors
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send(result.rows[0].content);
  } catch (error) {
    console.error('Raw fetch error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}
