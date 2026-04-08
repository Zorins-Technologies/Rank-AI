// sql.service.js – PostgreSQL connection pool using node-postgres (pg)
// Reads configuration from environment variables.
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  ssl: {
    rejectUnauthorized: false
  },
  // Adjust pool size for Cloud Run concurrency limits if needed
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test the connection on startup
(async () => {
  try {
    console.log(`Attempting to connect to PostgreSQL at ${process.env.DB_HOST}:${process.env.DB_PORT || 5432}...`);
    const res = await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected successfully – server time:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Database connection error:');
    console.error('Code:', err.code);
    console.error('Message:', err.message);
    console.error('Detail:', err.detail || 'None');
    console.error('Hint:', err.hint || 'None');
    console.error('Config:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      ssl: true
    });
  }
})();

module.exports = {
  // Simple query helper
  query: (text, params) => pool.query(text, params),
  // Get a client for transactions
  getClient: () => pool.connect(),
};
