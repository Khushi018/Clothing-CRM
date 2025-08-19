const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Import user routes
const userRoutes = require("./routes/userRoutes");

// Import error handling middleware
const { errorHandler, notFound } = require("./middlewares/errorHandler");

const app = express();
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// User API Routes
app.use("/api/v1/users", userRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "User CRUD API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Welcome to User CRUD API", 
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      users: "/api/v1/users",
      health: "/health"
    }
  });
});

// 404 handler for undefined routes
app.use(notFound);

// Global error handling middleware (must be last)
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`User CRUD API Server running on port ${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log(`Users API: http://localhost:${PORT}/api/v1/users`);
  console.log(`Server started at: ${new Date().toISOString()}`);
});
