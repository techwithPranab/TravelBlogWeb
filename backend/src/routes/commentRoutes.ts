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
  getFlaggedComments
} from '../controllers/commentController'
import { protect, restrictTo } from '../middleware/auth'

const router = express.Router()

// Public routes
router.get('/:resourceType/:resourceId', getComments)
router.get('/stats/:resourceType/:resourceId', getCommentStats)
router.get('/flagged', getFlaggedComments)
router.get('/:id', getComment)

// Protected routes
router.use(protect)

router.post('/', submitComment)
router.put('/:id', editComment)
router.delete('/:id', deleteComment)
router.post('/:id/like', likeComment)
router.post('/:id/dislike', dislikeComment)
router.post('/:id/flag', flagComment)

// Admin only routes
router.patch('/:id/moderate', restrictTo('admin'), moderateComment)

export default router
