"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const readerController_1 = require("../controllers/readerController");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
// Configure multer for avatar uploads (memory storage)
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit for avatars
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
// Test Cloudinary connection (no auth required for testing)
router.get('/test-cloudinary', async (req, res) => {
    try {
        const { testCloudinaryConnection } = await Promise.resolve().then(() => __importStar(require('../config/drive')));
        const result = await testCloudinaryConnection();
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Test failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// All routes below require authentication
router.use(auth_1.protect);
// Dashboard routes
router.get('/dashboard', readerController_1.getReaderDashboard);
// Profile routes
router.get('/profile', readerController_1.getReaderProfile);
router.put('/profile', readerController_1.updateReaderProfile);
router.post('/avatar', upload.single('avatar'), readerController_1.uploadReaderAvatar);
// Reading history and recommendations
router.get('/history', readerController_1.getReadingHistory);
router.get('/recommendations', readerController_1.getPersonalizedRecommendations);
exports.default = router;
