import express from 'express'
import {
  getDashboardStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllPostsAdmin,
  updatePostStatus,
  deletePost,
  createPost,
  updatePost,
  getPost,
  approvePost,
  getPendingPosts,
  moderatePost,
  submitPostForReview,
  getAllDestinationsAdmin,
  deleteDestination,
  createDestination,
  updateDestination,
  getDestination,
  getAllGuidesAdmin,
  deleteGuide,
  createGuide,
  updateGuide,
  getGuide,
  getSettings,
  updateSettings
} from '../controllers/adminController'
import { requireAdmin } from '../middleware/adminAuth'

const router = express.Router()

// All routes require admin authentication
router.use(requireAdmin)

// Dashboard
router.get('/dashboard/stats', getDashboardStats)

// Users Management
router.get('/users', getAllUsers)
router.post('/users', createUser)
router.put('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)

// Posts Management
router.get('/posts', getAllPostsAdmin)
router.get('/posts/pending', getPendingPosts)
router.post('/posts', createPost)
router.get('/posts/:id', getPost)
router.put('/posts/:id', updatePost)
router.put('/posts/:id/status', updatePostStatus)
router.put('/posts/:id/approve', approvePost)
router.put('/posts/:id/moderate', moderatePost)
router.put('/posts/:id/submit', submitPostForReview)
router.delete('/posts/:id', deletePost)

// Destinations Management
router.get('/destinations', getAllDestinationsAdmin)
router.post('/destinations', createDestination)
router.get('/destinations/:id', getDestination)
router.put('/destinations/:id', updateDestination)
router.delete('/destinations/:id', deleteDestination)

// Guides Management
router.get('/guides', getAllGuidesAdmin)
router.post('/guides', createGuide)
router.get('/guides/:id', getGuide)
router.put('/guides/:id', updateGuide)
router.delete('/guides/:id', deleteGuide)

// Settings Management
router.get('/settings', getSettings)
router.put('/settings', updateSettings)

export default router
