import express from 'express'
import { 
  getComments,
  submitComment,
  editComment,
  deleteComment,
  likeComment,
  dislikeComment,
  flagComment,
  moderateComment,
  getComment,
  getCommentStats,
  getFlaggedComments,
  getAllCommentsAdmin
} from '../controllers/commentController'
import { protect, restrictTo, optionalAuth } from '../middleware/auth'

const router = express.Router()

// Admin only routes (MUST be before wildcard routes)
router.get('/admin/all', protect, restrictTo('admin'), getAllCommentsAdmin)
router.patch('/:commentId/moderate', protect, restrictTo('admin'), moderateComment)
router.delete('/:commentId', protect, restrictTo('admin'), deleteComment)

// Public routes
router.get('/stats/:resourceType/:resourceId', getCommentStats)
router.get('/flagged', getFlaggedComments)
router.get('/:resourceType/:resourceId', getComments)
router.post('/', optionalAuth, submitComment) // Allow both authenticated and anonymous users

// Protected routes
router.use(protect)

router.get('/:id', getComment)
router.put('/:id', editComment)
router.post('/:id/like', likeComment)
router.post('/:id/dislike', dislikeComment)
router.post('/:id/flag', flagComment)

export default router
