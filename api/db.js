// =====================================================
// PostgreSQL Database Connection Helper
// Works with ANY PostgreSQL provider (Wispbyte, Neon, etc.)
// =====================================================

const { Pool } = require('pg');

// Connection pool - stores the database connection
let pool = null;

// Function to get or create the connection pool
function getPool() {
  if (!pool) {
    // Check if DATABASE_URL environment variable exists
    if (!process.env.DATABASE_URL) {
      console.error('ERROR: DATABASE_URL environment variable is not set!');
      throw new Error('DATABASE_URL is required');
    }
    
    // Create new connection pool
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false  // Required for Wispbyte and most hosted PostgreSQL
      },
      max: 10,                      // Maximum 10 connections
      idleTimeoutMillis: 30000,     // Close idle connections after 30 seconds
      connectionTimeoutMillis: 5000 // Timeout after 5 seconds
    });
    
    // Test the connection
    pool.connect((err, client, release) => {
      if (err) {
        console.error('Database connection error:', err.message);
      } else {
        console.log('✅ Database connected successfully!');
        release();
      }
    });
  }
  return pool;
}

// Helper function to run SQL queries
// Usage: const result = await query('SELECT * FROM scripts WHERE id = $1', [id]);
async function query(text, params) {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();  // Always release the client back to the pool
  }
}

// Helper function to check if database is alive
async function checkConnection() {
  try {
    const result = await query('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

// Export functions for use in other API files
module.exports = { 
  query, 
  getPool,
  checkConnection 
};
