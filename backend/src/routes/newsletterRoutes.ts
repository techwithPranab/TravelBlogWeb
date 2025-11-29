import express from 'express';
import { body } from 'express-validator';
import {
  subscribe,
  unsubscribe,
  verifyEmail,
  updatePreferences,
  getStats,
  getSubscribers,
  getMetrics
} from '@/controllers/newsletterController';
import { protect, adminOnly } from '@/middleware/auth';
import { validate } from '@/middleware/validate';

const router = express.Router();

// Validation rules
const subscribeValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('source')
    .optional()
    .isIn(['homepage', 'blog', 'popup', 'footer', 'manual', 'newsletter-page'])
    .withMessage('Invalid subscription source'),
  body('preferences.weekly')
    .optional()
    .isBoolean()
    .withMessage('Weekly preference must be a boolean'),
  body('preferences.deals')
    .optional()
    .isBoolean()
    .withMessage('Deals preference must be a boolean'),
  body('preferences.destinations')
    .optional()
    .isBoolean()
    .withMessage('Destinations preference must be a boolean'),
  body('preferences.tips')
    .optional()
    .isBoolean()
    .withMessage('Tips preference must be a boolean'),
  body('preferences.travelTips')
    .optional()
    .isBoolean()
    .withMessage('Travel tips preference must be a boolean'),
  body('preferences.photography')
    .optional()
    .isBoolean()
    .withMessage('Photography preference must be a boolean'),
  body('preferences.weeklyDigest')
    .optional()
    .isBoolean()
    .withMessage('Weekly digest preference must be a boolean')
];

const unsubscribeValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('token')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Invalid token')
];

const preferencesValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('preferences')
    .isObject()
    .withMessage('Preferences must be an object'),
  body('token')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Invalid token')
];

// Public routes
router.get('/public/metrics', getMetrics);
router.post('/subscribe', subscribeValidation, validate, subscribe);
router.post('/unsubscribe', unsubscribeValidation, validate, unsubscribe);
router.get('/verify/:token', verifyEmail);
router.put('/preferences', preferencesValidation, validate, updatePreferences);

// Admin routes
router.get('/stats', protect, adminOnly, getStats);
router.get('/subscribers', protect, adminOnly, getSubscribers);

export default router;
