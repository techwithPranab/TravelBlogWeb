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

// Public routes
router.get('/:resourceType/:resourceId', getComments)
router.get('/stats/:resourceType/:resourceId', getCommentStats)
router.get('/flagged', getFlaggedComments)
router.post('/', optionalAuth, submitComment) // Allow both authenticated and anonymous users

// Admin only routes (before protected middleware)
router.get('/admin/all', protect, restrictTo('admin'), getAllCommentsAdmin)

// Protected routes
router.use(protect)

router.get('/:id', getComment)
router.put('/:id', editComment)
router.post('/:id/like', likeComment)
router.post('/:id/dislike', dislikeComment)
router.post('/:id/flag', flagComment)

// Admin only routes
router.patch('/:id/moderate', restrictTo('admin'), moderateComment)
router.delete('/:id', restrictTo('admin'), deleteComment)

export default router
