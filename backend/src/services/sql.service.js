// sql.service.js – PostgreSQL connection pool using node-postgres (pg)
// Reads configuration from environment variables.
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log("DB CONNECTED"))
  .catch(err => console.error("DB ERROR:", err));

module.exports = {
  // Simple query helper
  query: (text, params) => pool.query(text, params),
  // Get a client for transactions
  getClient: () => pool.connect(),
};
