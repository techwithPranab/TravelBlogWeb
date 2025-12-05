"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commentController_1 = require("../controllers/commentController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Admin only routes (MUST be before wildcard routes)
router.get('/admin/all', auth_1.protect, (0, auth_1.restrictTo)('admin'), commentController_1.getAllCommentsAdmin);
router.patch('/:commentId/moderate', auth_1.protect, (0, auth_1.restrictTo)('admin'), commentController_1.moderateComment);
router.delete('/:commentId', auth_1.protect, (0, auth_1.restrictTo)('admin'), commentController_1.deleteComment);
// Public routes
router.get('/stats/:resourceType/:resourceId', commentController_1.getCommentStats);
router.get('/flagged', commentController_1.getFlaggedComments);
router.get('/:resourceType/:resourceId', commentController_1.getComments);
router.post('/', auth_1.optionalAuth, commentController_1.submitComment); // Allow both authenticated and anonymous users
// Protected routes
router.use(auth_1.protect);
router.get('/:id', commentController_1.getComment);
router.put('/:id', commentController_1.editComment);
router.post('/:id/like', commentController_1.likeComment);
router.post('/:id/dislike', commentController_1.dislikeComment);
router.post('/:id/flag', commentController_1.flagComment);
exports.default = router;
