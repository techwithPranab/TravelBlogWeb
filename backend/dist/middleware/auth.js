"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = exports.restrictTo = exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    try {
        let token;
        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Not authorized to access this route'
            });
            return;
        }
        try {
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            // Get user from database
            const user = await User_1.default.findById(decoded.id);
            if (!user) {
                res.status(401).json({
                    success: false,
                    error: 'No user found with this token'
                });
                return;
            }
            req.user = user;
            next();
        }
        catch (error) {
            res.status(401).json({
                success: false,
                error: 'Not authorized to access this route'
            });
            return;
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error during authentication'
        });
        return;
    }
};
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authorized to access this route'
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: `User role ${req.user.role} is not authorized to access this route`
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
// Alias for authorize function
exports.restrictTo = exports.authorize;
// Admin only middleware
const adminOnly = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'Not authorized to access this route'
        });
        return;
    }
    if (req.user.role !== 'admin') {
        res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
        return;
    }
    next();
};
exports.adminOnly = adminOnly;
