import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User, { IUser } from '@/models/User'
import Subscription from '@/models/Subscription'
import { AuthenticatedRequest } from '../types/express'

// Generate JWT Token
const signToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET environment variable is not set!');
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  // Use any to bypass TypeScript type checking for expiresIn
  return jwt.sign({ id }, secret, { expiresIn } as any);
}

// Send token response
const sendTokenResponse = (user: IUser, statusCode: number, res: Response): void => {
  // Always convert _id to string for JWT
  const userId = user._id ? user._id.toString() : '';
  const token = signToken(userId);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isPremium: user.isPremium,
    },
  });
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      })
      return
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'reader', // Default to reader if no role provided
    })

    // Create free subscription for new user
    try {
      await Subscription.createFreeSubscription(user._id)
    } catch (subscriptionError) {
      console.error('Failed to create subscription for new user:', subscriptionError)
      // Don't fail registration if subscription creation fails
    }

    sendTokenResponse(user, 201, res)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error during registration'
    })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body
    console.log('Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      })
      return
    }

    // Find user by email (include password for comparison)
    console.log('Looking up user in database...');
    const user = await User.findOne({ email }).select('+password')
    
    if (!user) {
      console.log('User not found for email:', email);
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
      return
    }

    console.log('User found, comparing password...');
    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
      return
    }

    console.log('Login successful for user:', email);
    sendTokenResponse(user, 200, res)
  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error during login'
    })
  }
}

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logout = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  })
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id)
    
    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      bio: req.body.bio,
      socialLinks: req.body.socialLinks,
    }

    const user = await User.findByIdAndUpdate(req.user?._id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('+password')
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      })
      return
    }

    // Check current password
    const isMatch = await user.comparePassword(req.body.currentPassword)
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      })
      return
    }

    user.password = req.body.newPassword
    await user.save()

    sendTokenResponse(user, 200, res)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'No user found with that email'
      })
      return
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex')

    // Hash token and set to resetPasswordToken field
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    // Set expire to 1 hour
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await user.save({ validateBeforeSave: false })

    // Create reset URL for frontend
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`

    try {
      // Send email using email service
      const { emailService } = require('@/services/emailService')
      await emailService.sendPasswordResetEmail(user.email, user.name, resetUrl, resetToken)

      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully'
      })
    } catch (error) {
      console.error('Error sending password reset email:', error)
      user.passwordResetToken = undefined
      user.passwordResetExpires = undefined

      await user.save({ validateBeforeSave: false })

      res.status(500).json({
        success: false,
        error: 'Email could not be sent'
      })
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 [RESET PASSWORD] Reset password request received')
    console.log('🔄 [RESET PASSWORD] Token:', req.params.token)
    console.log('🔄 [RESET PASSWORD] Body:', { password: !!req.body.password, confirmPassword: !!req.body.confirmPassword })
    
    const { password, confirmPassword } = req.body

    // Validate password and confirmPassword
    if (!password || !confirmPassword) {
      console.log('❌ [RESET PASSWORD] Missing password or confirmPassword')
      res.status(400).json({
        success: false,
        error: 'Please provide both password and confirm password'
      })
      return
    }

    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        error: 'Passwords do not match'
      })
      return
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      })
      return
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')

    console.log('🔍 [RESET PASSWORD] Looking for user with hashed token:', resetPasswordToken)
    console.log('🔍 [RESET PASSWORD] Current time:', Date.now())

    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpires: { $gt: Date.now() },
    })

    if (!user) {
      console.log('❌ [RESET PASSWORD] User not found with token or token expired')
      
      // Check if user exists with any reset token (for debugging)
      const userWithToken = await User.findOne({ passwordResetToken: resetPasswordToken })
      if (userWithToken) {
        console.log('🔍 [RESET PASSWORD] User found but token expired. Expires at:', userWithToken.passwordResetExpires)
      } else {
        console.log('🔍 [RESET PASSWORD] No user found with this token')
      }
      
      res.status(400).json({
        success: false,
        error: 'Invalid or expired token'
      })
      return
    }

    // Set new password
    console.log('📝 [RESET PASSWORD] Updating password for user:', user.email)
    
    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    
    console.log('📝 [RESET PASSWORD] Saving user with new password...')
    await user.save()
    
    console.log('✅ [RESET PASSWORD] Password successfully updated for user:', user.email)

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
    })

    if (!user) {
      res.status(400).json({
        success: false,
        error: 'Invalid verification token'
      })
      return
    }

    user.isEmailVerified = true
    user.emailVerificationToken = undefined
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Forgot password

