const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./src/config'); 
const blogRoutes = require('./src/routes/blog.routes');

const app = express();
const PORT = config.port || 8000;

// Security and Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  console.error('[CRITICAL SERVER ERROR]:', err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Internal Server Error',
    message: err.message
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

// Graceful Port Management
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[FATAL]: Port ${PORT} already in use. Please clear old processes.`);
    process.exit(1);
  }
});
