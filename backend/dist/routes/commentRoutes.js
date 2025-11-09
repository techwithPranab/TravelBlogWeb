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
router.get('/:id', commentController_1.getComment);
router.post('/', commentController_1.submitComment); // Make comment submission public
// Protected routes
router.use(auth_1.protect);
router.put('/:id', commentController_1.editComment);
router.delete('/:id', commentController_1.deleteComment);
router.post('/:id/like', commentController_1.likeComment);
router.post('/:id/dislike', commentController_1.dislikeComment);
router.post('/:id/flag', commentController_1.flagComment);
// Admin only routes
router.patch('/:id/moderate', (0, auth_1.restrictTo)('admin'), commentController_1.moderateComment);
exports.default = router;
