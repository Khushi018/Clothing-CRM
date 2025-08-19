// Global error handling middleware

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value';
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }
  
  // Send error response
  res.status(statusCode).json({
    error: message,
    status: 'error',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  });
};

// 404 handler for undefined routes
const notFound = (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    status: 'error',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  });
};

module.exports = {
  errorHandler,
  notFound
}; 