"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const contributorController_1 = require("../controllers/contributorController");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
// Configure multer for image uploads
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
// All routes require authentication and contributor role
router.use(auth_1.protect);
router.use((0, auth_1.restrictTo)('admin', 'contributor'));
// Dashboard
router.get('/dashboard', contributorController_1.getContributorDashboard);
// Post management
router.get('/posts', contributorController_1.getContributorPosts);
router.post('/posts', contributorController_1.createContributorPost);
router.put('/posts/:id', contributorController_1.updateContributorPost);
router.delete('/posts/:id', contributorController_1.deleteContributorPost);
// Image upload
router.post('/upload-image', upload.single('image'), contributorController_1.uploadContributorImage);
exports.default = router;
