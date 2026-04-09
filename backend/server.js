const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./src/config'); 
const db = require('./src/services/sql.service');
const blogRoutes = require('./src/routes/blog.routes.js');
const keywordRoutes = require('./src/routes/keyword.routes.js');
const { apiLimiter } = require('./src/middleware/rateLimit');
const { startAutoGenerateJob } = require('./src/jobs/autoGenerate.job');

const app = express();
const PORT = process.env.PORT || 8080;

// Required for Cloud Run to correctly identify user IPs for rate limiting
app.set('trust proxy', 1);

// 1. CORS CONFIGURATION (Must be first to handle preflights)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

// Raw Headers Fallback to guarantee CORS compliance
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// 2. Standard Middlewares
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 3. Rate Limiting (Applied AFTER CORS)
app.use(apiLimiter);

// Professional Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'Rank AI SaaS Backend', 
    project: config.gcpProjectId,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health-db', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT NOW()');
    res.json({ dbTime: rows[0].now });
  } catch (error) {
    console.error('DB health check error:', error);
    res.status(500).json({ error: 'Database connection error' });
  }
});

// Business Logic Routes (SaaS)
app.use('/', blogRoutes);
app.use('/keywords', keywordRoutes);

// Compatibility fallback for root access
app.get('/', (req, res) => {
  res.redirect('/health');
});

// Final Catch-All for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, error: 'CORS Error: Origin not allowed' });
  }
  console.error('[CRITICAL SERVER ERROR]:', err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Internal Server Error',
    // Only expose error details in development
    ...(process.env.NODE_ENV !== 'production' && { message: err.message })
  });
});

// ─── On-Boot Database Migration ─────────────────────────────────────────────
async function runMigrations() {
  try {
    await db.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await db.query(`
      CREATE TABLE IF NOT EXISTS keyword_research (
        id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id      TEXT NOT NULL,
        niche        TEXT NOT NULL,
        keyword      TEXT NOT NULL,
        search_volume INT DEFAULT 0,
        difficulty   TEXT DEFAULT 'medium',
        intent       TEXT DEFAULT 'informational',
        status       TEXT DEFAULT 'pending',
        blog_id      UUID REFERENCES blogs(id) ON DELETE SET NULL,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS keyword_research_user_keyword_idx
      ON keyword_research (user_id, keyword)
    `);
    await db.query(`
      CREATE INDEX IF NOT EXISTS keyword_research_status_idx
      ON keyword_research (user_id, status, created_at DESC)
    `);
    console.log('[Migration] keyword_research table ready.');
  } catch (err) {
    console.error('[Migration] Error:', err.message);
  }
}

// Startup logic
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`\n============================================`);
  console.log(`  Rank AI SaaS — UP & RUNNING on 0.0.0.0:${PORT}`);
  console.log(`  Project: ${config.gcpProjectId}`);
  console.log(`  Modernized April 2026 (Gen AI SDK)`);
  console.log(`============================================\n`);

  await runMigrations();
  startAutoGenerateJob();
});

// Graceful Shutdown Handler
const shutdown = (signal) => {
  console.log(`\n[${signal}] Received. Shutting down Rank AI Backend...`);
  server.close(() => {
    console.log('  -> Server closed. Clean exit.');
    process.exit(0);
  });
  
  // Force exit after 3 seconds if server.close is hanging
  setTimeout(() => {
    console.error('  -> Could not close connections in time, forcing shut down.');
    process.exit(1);
  }, 3000);
};

// Listen for termination signals
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Graceful Port Management
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[FATAL]: Port ${PORT} already in use. Please clear old processes.`);
    process.exit(1);
  }
});
