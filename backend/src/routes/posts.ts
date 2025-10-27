import express from 'express'
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
  uploadPostImage,
  unifiedSearch
} from '../controllers/postController'
import { protect } from '../middleware/auth'
import multer from 'multer'

const router = express.Router()

// Configure multer for memory storage
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// Public routes
router.get('/', getPosts)
router.get('/search', getPosts) // Use getPosts for search functionality
router.get('/unified-search', unifiedSearch) // Unified search across all content types
router.get('/featured', getFeaturedPosts)
router.get('/popular', getPopularPosts)
router.get('/category/:category', getPostsByCategory)
router.get('/:identifier', getPost)

// Protected routes
router.post('/', protect, createPost)
router.put('/:id', protect, updatePost)
router.delete('/:id', protect, deletePost)
router.put('/:id/like', protect, likePost)
router.post('/:id/comments', protect, addComment)

// Image upload route
router.post('/upload-image', protect, upload.single('image'), uploadPostImage)

export default router
