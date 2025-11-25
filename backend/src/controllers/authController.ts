import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User, { IUser } from '@/models/User'

interface AuthenticatedRequest extends Request {
  user?: IUser
}

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

    // Set expire
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await user.save({ validateBeforeSave: false })

    try {
      // Here you would send email
      // await sendEmail({
      //   email: user.email,
      //   subject: 'Password reset token',
      //   message: `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`
      // })

      res.status(200).json({
        success: true,
        message: 'Email sent'
      })
    } catch (_err) {
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
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')

    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpires: { $gt: Date.now() },
    })

    if (!user) {
      res.status(400).json({
        success: false,
        error: 'Invalid token'
      })
      return
    }

    // Set new password
    user.password = req.body.password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    sendTokenResponse(user, 200, res)
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
