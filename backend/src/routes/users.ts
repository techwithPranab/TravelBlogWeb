import { Router } from 'express'
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadAvatar,
  followUser,
  getUserFollowers,
  getUserFollowing,
  getUserStats
} from '@/controllers/userController'
import { protect, authorize } from '@/middleware/auth'

const router = Router()

// Public routes
router.get('/:id', getUser)
router.get('/:id/followers', getUserFollowers)
router.get('/:id/following', getUserFollowing)
router.get('/:id/stats', getUserStats)

// Protected routes
router.put('/:id/avatar', protect, uploadAvatar)
router.put('/:id/follow', protect, followUser)

// Admin only routes
router.get('/', protect, authorize('admin'), getUsers)
router.post('/', protect, authorize('admin'), createUser)
router.put('/:id', protect, authorize('admin'), updateUser)
router.delete('/:id', protect, authorize('admin'), deleteUser)

export default router
