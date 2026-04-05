const db = require('./db');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Missing title or content' });
  }

  // Optional: Add admin key validation
  // const adminKey = req.headers['x-admin-key'];
  // if (adminKey !== process.env.ADMIN_KEY) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  try {
    const result = await db.query(
      'INSERT INTO scripts (title, content, created_at) VALUES ($1, $2, NOW()) RETURNING id',
      [title, content]
    );
    
    return res.status(200).json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to save script', details: error.message });
  }
}
