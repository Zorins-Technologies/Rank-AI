const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./src/config'); 
const db = require('./src/services/sql.service');
const blogRoutes = require('./src/routes/blog.routes.js');
const { apiLimiter } = require('./src/middleware/rateLimit');

const app = express();
const PORT = config.port || 8000;

// 1. CORS CONFIGURATION (Must be first to handle preflights)
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [
      'http://localhost:3000', 
      'http://localhost:3001',
      /\.web\.app$/, 
      /\.firebaseapp\.com$/,
      /\.apphosting\.dev$/
    ];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    // Check both string equality and RegExp patterns
    const isAllowed = allowedOrigins.some(allowed =>
      allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
    );
    if (isAllowed || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS BEFORE any other middleware
app.use(cors(corsOptions));

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
app.use('/api', blogRoutes);

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

// Startup logic
const server = app.listen(PORT, () => {
  console.log(`\n============================================`);
  console.log(`  Rank AI SaaS — UP & RUNNING on Port ${PORT}`);
  console.log(`  Project: ${config.gcpProjectId}`);
  console.log(`  Modernized April 2026 (Gen AI SDK)`);
  console.log(`============================================\n`);
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
