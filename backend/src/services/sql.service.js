// sql.service.js – PostgreSQL connection pool using node-postgres (pg)
// Reads configuration from environment variables.
const { Pool } = require('pg');

const { config } = require('../config');

/**
 * Helper to ensure a valid connection string.
 * Priority: process.env.DATABASE_URL > config.databaseUrl > constructed from components.
 */
function getConnectionConfig() {
  // Priority: DATABASE_URL (GSM/ENV) > constructed from components.
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL };
  }

  const user = process.env.DB_USER || '';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || '';
  
  // Production Cloud Run handles connection via Unix Socket
  if (config.env === 'production') {
    const instanceConnectionName = process.env.INSTANCE_CONNECTION_NAME;
    if (!instanceConnectionName) {
      console.warn('[DB] Delaying connection: INSTANCE_CONNECTION_NAME not yet available.');
      return null; 
    }
    
    console.log(`[DB] Production mode: Using Cloud SQL Unix Socket: ${instanceConnectionName}`);
    // Standard pg driver format for Unix Sockets: use 'host' for folder path
    return {
      user,
      password,
      database,
      host: `/cloudsql/${instanceConnectionName}`,
    };
  }

  // Development/External Fallback
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';

  return {
    user,
    password,
    database,
    host,
    port,
  };
}


let pool = null;

function getPool() {
  if (pool) return pool;

  const dbConfig = getConnectionConfig();
  if (!dbConfig) {
    console.warn('[DB] Connection pool creation deferred until credentials available.');
    return {
      query: () => { throw new Error('Database not yet initialized. Please wait for Secret Manager hydration.'); },
      connect: () => { throw new Error('Database not yet initialized. Please wait for Secret Manager hydration.'); }
    };
  }

  const hostLabel = dbConfig.host || 'localhost';
  console.log(`[DB] Creating pool with host: ${hostLabel}`);
  
  const isSocket = hostLabel.startsWith('/cloudsql/');
  
  pool = new Pool({
    ...dbConfig,
    max: 15, // Slightly increased for production concurrency
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: isSocket ? false : {
      rejectUnauthorized: false
    }
  });

  pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client', err);
  });

  return pool;
}

module.exports = {
  get pool() { return getPool(); }, // Property getter for graceful shutdown access
  query: (text, params) => getPool().query(text, params),
  getClient: () => getPool().connect(),
};
