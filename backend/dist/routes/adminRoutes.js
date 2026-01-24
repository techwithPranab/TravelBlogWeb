"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const adminAuth_1 = require("../middleware/adminAuth");
const guideController_1 = require("../controllers/guideController");
const postController_1 = require("../controllers/postController");
const multer_1 = __importDefault(require("multer"));
// Configure multer for post image uploads with increased limit
const postStorage = multer_1.default.memoryStorage();
const postUpload = (0, multer_1.default)({
    storage: postStorage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
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
const router = express_1.default.Router();
// All routes require admin authentication
router.use(adminAuth_1.requireAdmin);
// Dashboard
router.get('/dashboard/stats', adminController_1.getDashboardStats);
// Users Management
router.get('/users', adminController_1.getAllUsers);
router.post('/users', adminController_1.createUser);
router.put('/users/:id', adminController_1.updateUser);
router.delete('/users/:id', adminController_1.deleteUser);
// Posts Management
router.get('/posts', adminController_1.getAllPostsAdmin);
router.get('/posts/pending', adminController_1.getPendingPosts);
router.post('/posts', adminController_1.createPost);
router.post('/posts/upload-image', postUpload.single('image'), postController_1.uploadPostImage);
router.get('/posts/:id', adminController_1.getPost);
router.put('/posts/:id', adminController_1.updatePost);
router.put('/posts/:id/status', adminController_1.updatePostStatus);
router.put('/posts/:id/approve', adminController_1.approvePost);
router.put('/posts/:id/moderate', adminController_1.moderatePost);
router.put('/posts/:id/submit', adminController_1.submitPostForReview);
router.delete('/posts/:id', adminController_1.deletePost);
// Destinations Management
router.get('/destinations', adminController_1.getAllDestinationsAdmin);
router.post('/destinations', adminController_1.createDestination);
router.get('/destinations/:id', adminController_1.getDestination);
router.put('/destinations/:id', adminController_1.updateDestination);
router.delete('/destinations/:id', adminController_1.deleteDestination);
// Guides Management
router.get('/guides', adminController_1.getAllGuidesAdmin);
router.post('/guides', adminController_1.createGuide);
router.get('/guides/:id', adminController_1.getGuide);
router.put('/guides/:id', adminController_1.updateGuide);
router.delete('/guides/:id', adminController_1.deleteGuide);
router.post('/guides/upload-image', guideController_1.upload.single('image'), guideController_1.uploadGuideImage);
// Settings Management
router.get('/settings', adminController_1.getSettings);
router.put('/settings', adminController_1.updateSettings);
// Email Management
router.post('/test-email', adminController_1.sendTestEmail);
// Email Templates Management
router.get('/email-templates', adminController_1.getEmailTemplates);
router.get('/email-templates/:id', adminController_1.getEmailTemplate);
router.put('/email-templates/:id', adminController_1.updateEmailTemplate);
router.post('/email-templates', adminController_1.createEmailTemplate);
router.delete('/email-templates/:id', adminController_1.deleteEmailTemplate);
exports.default = router;
