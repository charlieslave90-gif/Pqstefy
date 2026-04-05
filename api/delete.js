// =============================================================
// FILE: /api/delete.js (DELETE script - Admin only)
// =============================================================

const db = require('./db');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.body;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Valid ID required' });
  }

  try {
    await db.query('DELETE FROM scripts WHERE id = $1', [parseInt(id)]);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ error: 'Failed to delete script' });
  }
}
