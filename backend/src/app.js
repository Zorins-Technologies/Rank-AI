const express = require("express");
const cors = require("cors");
const config = require("./config");
const blogRoutes = require("./routes/blog.routes");

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "rank-ai-backend",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api", blogRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// Start server
app.listen(config.port, () => {
  console.log(`\n🚀 RANK AI Backend running on http://localhost:${config.port}`);
  console.log(`   Project: ${config.gcpProjectId}`);
  console.log(`   Bucket:  ${config.gcsBucketName}`);
  console.log(`   Region:  ${config.vertexLocation}\n`);
});
