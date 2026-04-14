const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { config, hydrateConfigWithSecrets } = require('./src/config');

// ─── CRASH-ON-ERROR (ROBUST RESTART) ─────────────────────────────────────────
// Catch unhandled exceptions, log them, and exit.
// This allows container orchestrators (like Cloud Run) to restart the service,
// which is a best practice for resilient applications.
process.on('uncaughtException', (err, origin) => {
  console.error(`[FATAL] Uncaught exception: ${err.message}`, {
    error: err,
    origin: origin,
    stack: err.stack,
  });
  process.exit(1);
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Promise Rejection:', { reason, promise });
  process.exit(1);
});

const app = express();
const PORT = config.port || 8080;

// ─── STARTUP (INSTANT PORT BINDING & ASYNC INIT) ─────────────────────────────
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\x1b[32m%s\x1b[0m', `[BOOT] Server listening on 0.0.0.0:${PORT}`);
  initServices();
});

// ─── GLOBAL STATUS FLAGS ─────────────────────────────────────────────────────
let dbStatus = 'INITIALIZING';
let secretsStatus = 'INITIALIZING';

// ─── HEALTH CHECKS (GLOBAL) ──────────────────────────────────────────────────
app.get('/health', (req, res) => res.status(200).json({ 
  status: 'UP', 
  database: dbStatus,
  secrets: secretsStatus, 
  env: process.env.NODE_ENV 
}));
app.get('/', (req, res) => res.status(200).json({
  status: 'UP',
  message: 'Rank AI backend is running',
  database: dbStatus,
  secrets: secretsStatus,
  env: process.env.NODE_ENV
}));


// ─── TRUST PROXY ─────────────────────────────────────────────────────────────
app.set('trust proxy', 1);

// ─── MIDDLEWARE (BOOTSTRAP) ──────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

// JSON body parsing — skip for Stripe webhook (needs raw body for signature verification)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') return next();
  express.json()(req, res, next);
});
app.use(express.urlencoded({ extended: true }));

// ─── CORS CONFIGURATION ──────────────────────────────────────────────────────
const defaultAllowedOrigins = [
  'https://rankai.zorins.tech',
  'https://www.rankai.zorins.tech',
  'https://rank-ai-frontend.pages.dev',
  'https://rank-ai-frontend-156538337442.us-central1.run.app'
];

const configuredOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];

const allowedOrigins = [...defaultAllowedOrigins, ...configuredOrigins];

const corsOptions = {
  origin: (origin, callback) => {
    const isDev = process.env.NODE_ENV !== 'production';
    const isDomainAllowed = !origin || (
      allowedOrigins.includes(origin) || 
      /\.zorins\.tech$/.test(origin) || 
      /\.pages\.dev$/.test(origin) ||
      isDev
    );
    if (isDomainAllowed) callback(null, true);
    else callback(null, new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ─── PATH HARDENING ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.url.startsWith('/api/api/')) {
    // 308 Redirect preserves the original method (e.g. POST)
    return res.redirect(308, req.url.replace('/api/api/', '/api/'));
  }
  next();
});


// ─── ROUTE REGISTRATION ──────────────────────────────────────────────────────
const apiRoutes = [
  { path: '/api/blogs', module: './src/routes/blog.routes' },
  { path: '/api/projects', module: './src/routes/project.routes' },
  { path: '/api/keywords', module: './src/routes/keyword.routes' },
  { path: '/api/aeo', module: './src/routes/aeo.routes' },
  { path: '/api/backlinks', module: './src/routes/backlink.routes' },
  { path: '/api/stripe', module: './src/routes/stripe.routes' },
  { path: '/api/growth-plan', module: './src/routes/growthPlan.routes' },
  { path: '/api/publish', module: './src/routes/publish.routes' }
];

console.log('[BOOT] Registering API routes...');
try {
  apiRoutes.forEach(route => {
    app.use(route.path, require(route.module));
    // console.log(`[BOOT] Registered: ${route.path}`);
  });
  console.log('[BOOT] All routes registered successfully.');
} catch (routeErr) {
  console.error(`[FATAL BOOT ERROR] Failed to register routes: ${routeErr.message}`);
  console.error(routeErr.stack);
  process.exit(1);
}



/**
 * Async Background Initialization
 * Hydrates secrets and syncs DB without blocking the HTTP listener.
 */

async function initServices() {
  try {
    const { runMigrations } = require('./src/services/db.init');

    // 1. Hydrate configurations from Secret Manager (Production only)
    if (config.env === 'production') {
      try {
        await hydrateConfigWithSecrets();
        console.log('[Secrets] Hydration successful.');
        secretsStatus = 'LOADED';
      } catch (e) {
        console.error('[Secrets] Hydration failed:', e.message);
        secretsStatus = `FAILED: ${e.message}`;
      }
    } else {
      secretsStatus = 'SKIPPED (DEV)';
    }

    // 2. Synchronize Database
    try {
      await runMigrations();
      console.log('\x1b[32m%s\x1b[0m', '[DB] Connected and synchronized.');
      dbStatus = 'CONNECTED';
    } catch (dbErr) {
      console.error('[DB] Migration failed:', dbErr.message);
      dbStatus = `FAILED: ${dbErr.message}`;
    }

    // 3. Start Background Jobs
    try {
      const { startAutopilotJob } = require('./src/jobs/autopilot.job');
      const { startSystemBlogJob } = require('./src/jobs/systemBlog.job');
      startAutopilotJob();
      startSystemBlogJob();
    } catch (jobErr) {
      console.error('[INIT ERROR] Job scheduler failure:', jobErr.message);
    }

    console.log('[INIT] Background operations complete.');
  } catch (fatalErr) {
    console.error('[FATAL INIT ERROR]:', fatalErr.message, fatalErr.stack);
    // If core initialization (like requiring modules) fails, exit.
    process.exit(1);
  }
}


// ─── ERROR FALLBACKS (Must be registered after routes) ────────────────────────
app.use((req, res) => {
  console.log(`[404] No route matched: ${req.method} ${req.url}`);
  res.status(404).json({ 
    success: false, 
    error: `Route not found: ${req.method} ${req.url}`,
    tip: "Ensure you are using exact paths like /api/blogs/generate"
  });
});
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]:', err.message);
  res.status(err.message === 'Not allowed by CORS' ? 403 : 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});


// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down...');
  server.close(() => process.exit(0));
});
