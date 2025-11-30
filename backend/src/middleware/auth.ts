import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User, { IUser } from '@/models/User'

interface AuthenticatedRequest extends Request {
  user?: IUser
}

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      })
      return
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
      
      // Get user from database
      const user = await User.findById(decoded.id)
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'No user found with this token'
        })
        return
      }

      req.user = user
      next()
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      })
      return
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error during authentication'
    })
    return
  }
}

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      })
      return
    }

    next()
  }
}

// Alias for authorize function
export const restrictTo = authorize

// Admin only middleware
export const adminOnly = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    })
    return
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Admin access required'
    })
    return
  }

  next()
}

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
        const user = await User.findById(decoded.id).select('-password')
        if (user) {
          req.user = user
        }
      } catch (error) {
        // Invalid token, but we continue without authentication
        console.log('Invalid token in optional auth:', error)
      }
    }

    next()
  } catch (error) {
    // Even on error, continue without authentication
    next()
  }
}
