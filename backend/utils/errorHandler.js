/**
 * Centralized Error Handler Utility
 * Provides consistent error responses and logging
 */

class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response formatter
const sendErrorResponse = (res, error) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  // Log error details
  console.error(`[${new Date().toISOString()}] Error ${statusCode}:`, {
    message,
    stack: error.stack,
    url: res.req?.originalUrl,
    method: res.req?.method,
    userAgent: res.req?.get('User-Agent')
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';

  res.status(statusCode).json({
    success: false,
    status: error.status || 'error',
    message,
    ...(isDevelopment && { stack: error.stack })
  });
};

// Async error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Global error handler middleware
const globalErrorHandler = (err, req, res, next) => {
  // Log the error
  console.error('Global Error Handler:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    return sendErrorResponse(res, new AppError(message, 404));
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    return sendErrorResponse(res, new AppError(message, 400));
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    const message = `Invalid input data: ${errors.join('. ')}`;
    return sendErrorResponse(res, new AppError(message, 400));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    return sendErrorResponse(res, new AppError(message, 401));
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again.';
    return sendErrorResponse(res, new AppError(message, 401));
  }

  // Send operational errors
  if (err.isOperational) {
    return sendErrorResponse(res, err);
  }

  // Programming or other unknown errors
  console.error('💥 ERROR! Something went very wrong:', err);
  return sendErrorResponse(res, new AppError('Something went wrong!', 500));
};

module.exports = {
  AppError,
  sendErrorResponse,
  catchAsync,
  globalErrorHandler
};
