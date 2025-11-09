"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = express_1.default.Router();
// Validation rules
const registerValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];
const loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
];
const forgotPasswordValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email')
];
const resetPasswordValidation = [
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];
const updateProfileValidation = [
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio cannot be more than 500 characters'),
    (0, express_validator_1.body)('socialLinks.twitter')
        .optional()
        .isURL()
        .withMessage('Please provide a valid Twitter URL'),
    (0, express_validator_1.body)('socialLinks.instagram')
        .optional()
        .isURL()
        .withMessage('Please provide a valid Instagram URL'),
    (0, express_validator_1.body)('socialLinks.facebook')
        .optional()
        .isURL()
        .withMessage('Please provide a valid Facebook URL'),
    (0, express_validator_1.body)('socialLinks.website')
        .optional()
        .isURL()
        .withMessage('Please provide a valid website URL')
];
const updatePasswordValidation = [
    (0, express_validator_1.body)('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];
// Routes
router.post('/register', registerValidation, validate_1.validate, authController_1.register);
router.post('/login', loginValidation, validate_1.validate, authController_1.login);
router.post('/logout', authController_1.logout);
router.get('/me', auth_1.protect, authController_1.getMe);
router.post('/forgot-password', forgotPasswordValidation, validate_1.validate, authController_1.forgotPassword);
router.put('/reset-password/:token', resetPasswordValidation, validate_1.validate, authController_1.resetPassword);
router.put('/profile', auth_1.protect, updateProfileValidation, validate_1.validate, authController_1.updateProfile);
router.put('/password', auth_1.protect, updatePasswordValidation, validate_1.validate, authController_1.updatePassword);
router.get('/verify-email/:token', authController_1.verifyEmail);
exports.default = router;
