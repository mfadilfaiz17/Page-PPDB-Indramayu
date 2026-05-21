const express = require("express");
const router = express.Router();
const db = require("../config/database");

/**
 * GET /health
 * Health check endpoint for monitoring
 * Returns: { status, timestamp, database, uptime }
 */
router.get("/", async (req, res) => {
  try {
    // Test database connection
    await db.query("SELECT 1");
    
    return res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      uptime: process.uptime(),
      version: "1.0.0",
    });
  } catch (err) {
    return res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: err.message,
      uptime: process.uptime(),
    });
  }
});

module.exports = router;
