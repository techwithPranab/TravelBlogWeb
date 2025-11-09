"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const requireAdmin = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await User_1.default.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Admin auth error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};
exports.requireAdmin = requireAdmin;
