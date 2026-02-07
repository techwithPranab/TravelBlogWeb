"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController_1 = require("../controllers/postController");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
// Configure multer for memory storage
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
// Public routes
router.get('/', postController_1.getPosts);
router.get('/search', postController_1.getPosts); // Use getPosts for search functionality
router.get('/unified-search', postController_1.unifiedSearch); // Unified search across all content types
router.get('/featured', postController_1.getFeaturedPosts);
router.get('/popular', postController_1.getPopularPosts);
router.get('/category/:category', postController_1.getPostsByCategory);
router.get('/:identifier', postController_1.getPost);
// Protected routes
router.post('/', auth_1.protect, postController_1.createPost);
router.put('/:id', auth_1.protect, postController_1.updatePost);
router.delete('/:id', auth_1.protect, postController_1.deletePost);
router.put('/:id/like', auth_1.protect, postController_1.likePost);
router.post('/:id/comments', auth_1.protect, postController_1.addComment);
// Image upload route
router.post('/upload-image', auth_1.protect, upload.single('image'), postController_1.uploadPostImage);
exports.default = router;
