import { Request, Response, NextFunction } from 'express'

export interface ApiError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = { ...err }
  error.message = err.message

  // Log error
  console.error('❌ Error:', err)

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found'
    error = { ...error, message, statusCode: 404 }
  }

  // Mongoose duplicate key
  if (err.name === 'MongoServerError' && err.code === 11000) {
    const message = 'Duplicate field value entered'
    error = { ...error, message, statusCode: 400 }
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message).join(', ')
    error = { ...error, message, statusCode: 400 }
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token'
    error = { ...error, message, statusCode: 401 }
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired'
    error = { ...error, message, statusCode: 401 }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
