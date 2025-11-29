import express from 'express'
import { body } from 'express-validator'
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile,
  updatePassword,
  verifyEmail
} from '@/controllers/authController'
import { protect } from '@/middleware/auth'
import { validate } from '@/middleware/validate'

const router = express.Router()

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
]

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
]

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
]

const resetPasswordValidation = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
]

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
  body('socialLinks.twitter')
    .optional()
    .isURL()
    .withMessage('Please provide a valid Twitter URL'),
  body('socialLinks.instagram')
    .optional()
    .isURL()
    .withMessage('Please provide a valid Instagram URL'),
  body('socialLinks.facebook')
    .optional()
    .isURL()
    .withMessage('Please provide a valid Facebook URL'),
  body('socialLinks.website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL')
]

const updatePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
]

// Routes
router.post('/register', registerValidation, validate, register)
router.post('/login', loginValidation, validate, login)
router.post('/logout', logout)
router.get('/me', protect, getMe)
router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword)
router.post('/reset-password/:token', resetPasswordValidation, validate, resetPassword)
router.put('/profile', protect, updateProfileValidation, validate, updateProfile)
router.put('/password', protect, updatePasswordValidation, validate, updatePassword)
router.get('/verify-email/:token', verifyEmail)

export default router
