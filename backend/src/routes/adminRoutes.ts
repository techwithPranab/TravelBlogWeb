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
  getAllDestinationsAdmin,
  deleteDestination,
  getAllGuidesAdmin,
  deleteGuide,
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
router.put('/posts/:id/status', updatePostStatus)
router.delete('/posts/:id', deletePost)

// Destinations Management
router.get('/destinations', getAllDestinationsAdmin)
router.delete('/destinations/:id', deleteDestination)

// Guides Management
router.get('/guides', getAllGuidesAdmin)
router.delete('/guides/:id', deleteGuide)

// Settings Management
router.get('/settings', getSettings)
router.put('/settings', updateSettings)

export default router
