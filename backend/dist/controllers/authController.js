"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.resetPassword = exports.forgotPassword = exports.updatePassword = exports.updateProfile = exports.getMe = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
// Generate JWT Token
const signToken = (id) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error('JWT_SECRET environment variable is not set!');
        throw new Error('JWT_SECRET environment variable is required');
    }
    const expiresIn = process.env.JWT_EXPIRE || '7d';
    // Use any to bypass TypeScript type checking for expiresIn
    return jsonwebtoken_1.default.sign({ id }, secret, { expiresIn });
};
// Send token response
const sendTokenResponse = (user, statusCode, res) => {
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
};
// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Check if user exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                error: 'User already exists with this email'
            });
            return;
        }
        // Create user
        const user = await User_1.default.create({
            name,
            email,
            password,
            role: role || 'reader', // Default to reader if no role provided
        });
        sendTokenResponse(user, 201, res);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error during registration'
        });
    }
};
exports.register = register;
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);
        // Validate input
        if (!email || !password) {
            console.log('Missing email or password');
            res.status(400).json({
                success: false,
                error: 'Please provide email and password'
            });
            return;
        }
        // Find user by email (include password for comparison)
        console.log('Looking up user in database...');
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            console.log('User not found for email:', email);
            res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
            return;
        }
        console.log('User found, comparing password...');
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
            return;
        }
        console.log('Login successful for user:', email);
        sendTokenResponse(user, 200, res);
    }
    catch (error) {
        console.error('Login error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error during login'
        });
    }
};
exports.login = login;
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = (req, res) => {
    res.status(200).json({
        success: true,
        message: 'User logged out successfully'
    });
};
exports.logout = logout;
// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?._id);
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.getMe = getMe;
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            bio: req.body.bio,
            socialLinks: req.body.socialLinks,
        };
        const user = await User_1.default.findByIdAndUpdate(req.user?._id, fieldsToUpdate, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.updateProfile = updateProfile;
// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?._id).select('+password');
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }
        // Check current password
        const isMatch = await user.comparePassword(req.body.currentPassword);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
            return;
        }
        user.password = req.body.newPassword;
        await user.save();
        sendTokenResponse(user, 200, res);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.updatePassword = updatePassword;
// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const user = await User_1.default.findOne({ email: req.body.email });
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'No user found with that email'
            });
            return;
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(20).toString('hex');
        // Hash token and set to resetPasswordToken field
        user.passwordResetToken = crypto_1.default
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        // Set expire to 1 hour
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save({ validateBeforeSave: false });
        // Create reset URL for frontend
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;
        try {
            // Send email using email service
            const { emailService } = require('../services/emailService');
            await emailService.sendPasswordResetEmail(user.email, user.name, resetUrl, resetToken);
            res.status(200).json({
                success: true,
                message: 'Password reset email sent successfully'
            });
        }
        catch (error) {
            console.error('Error sending password reset email:', error);
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
            res.status(500).json({
                success: false,
                error: 'Email could not be sent'
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.forgotPassword = forgotPassword;
// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;
        // Validate password and confirmPassword
        if (!password || !confirmPassword) {
            res.status(400).json({
                success: false,
                error: 'Please provide both password and confirm password'
            });
            return;
        }
        if (password !== confirmPassword) {
            res.status(400).json({
                success: false,
                error: 'Passwords do not match'
            });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long'
            });
            return;
        }
        // Get hashed token
        const resetPasswordToken = crypto_1.default
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');
        const user = await User_1.default.findOne({
            passwordResetToken: resetPasswordToken,
            passwordResetExpires: { $gt: Date.now() },
        });
        if (!user) {
            res.status(400).json({
                success: false,
                error: 'Invalid or expired token'
            });
            return;
        }
        // Set new password
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.resetPassword = resetPassword;
// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        const user = await User_1.default.findOne({
            emailVerificationToken: req.params.token,
        });
        if (!user) {
            res.status(400).json({
                success: false,
                error: 'Invalid verification token'
            });
            return;
        }
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.verifyEmail = verifyEmail;
// @desc    Forgot password
