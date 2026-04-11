// sql.service.js – PostgreSQL connection pool using node-postgres (pg)
// Reads configuration from environment variables.
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || require('../config').config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log("[DB] Pool initialized and connected."))
  .catch(err => console.error("[DB] Initialization ERROR:", err));

module.exports = {
  pool, // Exported for graceful shutdown
  // Simple query helper
  query: (text, params) => pool.query(text, params),
  // Get a client for transactions
  getClient: () => pool.connect(),
};
