const db = require('./db');

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await db.query(
      'SELECT id, title, created_at FROM scripts ORDER BY id DESC'
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
}
