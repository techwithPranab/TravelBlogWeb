import { Request } from 'express'
import { IUser } from '@/models/User'

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user: IUser
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: IUser
}
