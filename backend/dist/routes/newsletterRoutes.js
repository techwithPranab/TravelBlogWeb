"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const newsletterController_1 = require("@/controllers/newsletterController");
const auth_1 = require("@/middleware/auth");
const validate_1 = require("@/middleware/validate");
const router = express_1.default.Router();
// Validation rules
const subscribeValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('source')
        .optional()
        .isIn(['homepage', 'blog', 'popup', 'footer', 'manual', 'newsletter-page'])
        .withMessage('Invalid subscription source'),
    (0, express_validator_1.body)('preferences.weekly')
        .optional()
        .isBoolean()
        .withMessage('Weekly preference must be a boolean'),
    (0, express_validator_1.body)('preferences.deals')
        .optional()
        .isBoolean()
        .withMessage('Deals preference must be a boolean'),
    (0, express_validator_1.body)('preferences.destinations')
        .optional()
        .isBoolean()
        .withMessage('Destinations preference must be a boolean'),
    (0, express_validator_1.body)('preferences.tips')
        .optional()
        .isBoolean()
        .withMessage('Tips preference must be a boolean'),
    (0, express_validator_1.body)('preferences.travelTips')
        .optional()
        .isBoolean()
        .withMessage('Travel tips preference must be a boolean'),
    (0, express_validator_1.body)('preferences.photography')
        .optional()
        .isBoolean()
        .withMessage('Photography preference must be a boolean'),
    (0, express_validator_1.body)('preferences.weeklyDigest')
        .optional()
        .isBoolean()
        .withMessage('Weekly digest preference must be a boolean')
];
const unsubscribeValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('token')
        .optional()
        .isLength({ min: 1 })
        .withMessage('Invalid token')
];
const preferencesValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('preferences')
        .isObject()
        .withMessage('Preferences must be an object'),
    (0, express_validator_1.body)('token')
        .optional()
        .isLength({ min: 1 })
        .withMessage('Invalid token')
];
// Public routes
router.get('/public/metrics', newsletterController_1.getMetrics);
router.post('/subscribe', subscribeValidation, validate_1.validate, newsletterController_1.subscribe);
router.post('/unsubscribe', unsubscribeValidation, validate_1.validate, newsletterController_1.unsubscribe);
router.get('/verify/:token', newsletterController_1.verifyEmail);
router.put('/preferences', preferencesValidation, validate_1.validate, newsletterController_1.updatePreferences);
// Admin routes
router.get('/stats', auth_1.protect, auth_1.adminOnly, newsletterController_1.getStats);
router.get('/subscribers', auth_1.protect, auth_1.adminOnly, newsletterController_1.getSubscribers);
exports.default = router;
