"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commentController_1 = require("../controllers/commentController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get('/:resourceType/:resourceId', commentController_1.getComments);
router.get('/stats/:resourceType/:resourceId', commentController_1.getCommentStats);
router.get('/flagged', commentController_1.getFlaggedComments);
router.post('/', auth_1.optionalAuth, commentController_1.submitComment); // Allow both authenticated and anonymous users
// Admin only routes (before protected middleware)
router.get('/admin/all', auth_1.protect, (0, auth_1.restrictTo)('admin'), commentController_1.getAllCommentsAdmin);
// Protected routes
router.use(auth_1.protect);
router.get('/:id', commentController_1.getComment);
router.put('/:id', commentController_1.editComment);
router.post('/:id/like', commentController_1.likeComment);
router.post('/:id/dislike', commentController_1.dislikeComment);
router.post('/:id/flag', commentController_1.flagComment);
// Admin only routes
router.patch('/:id/moderate', (0, auth_1.restrictTo)('admin'), commentController_1.moderateComment);
router.delete('/:id', (0, auth_1.restrictTo)('admin'), commentController_1.deleteComment);
exports.default = router;
