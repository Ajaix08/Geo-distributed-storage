const logger = require('../logger');

// Centralized error handler. Never leaks stack traces to the client in production.
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  logger.error(err.message, {
    requestId: req.id,
    stack: err.stack,
    statusCode,
  });

  res.status(statusCode).json({
    success: false,
    message: err.isOperational ? err.message : 'Internal server error',
    ...(err.details ? { details: err.details } : {}),
  });
}

module.exports = errorHandler;
