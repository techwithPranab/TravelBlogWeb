import { Router } from 'express'
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  getPostsByCategory,
  getFeaturedPosts,
  getPopularPosts,
  searchPosts
} from '@/controllers/postController'
import { protect, authorize } from '@/middleware/auth'

const router = Router()

// Public routes
router.get('/', getPosts)
router.get('/featured', getFeaturedPosts)
router.get('/popular', getPopularPosts)
router.get('/search', searchPosts)
router.get('/category/:category', getPostsByCategory)
router.get('/:identifier', getPost)

// Protected routes
router.post('/', protect, authorize('author', 'admin'), createPost)
router.put('/:id', protect, authorize('author', 'admin'), updatePost)
router.delete('/:id', protect, authorize('author', 'admin'), deletePost)
router.put('/:id/like', protect, likePost)
router.post('/:id/comments', protect, addComment)

export default router
