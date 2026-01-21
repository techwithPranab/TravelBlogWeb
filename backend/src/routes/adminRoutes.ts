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
  updateSettings,
  sendTestEmail,
  getEmailTemplates,
  getEmailTemplate,
  updateEmailTemplate,
  createEmailTemplate,
  deleteEmailTemplate
} from '../controllers/adminController'
import { requireAdmin } from '../middleware/adminAuth'
import { uploadGuideImage, upload } from '../controllers/guideController'
import { uploadPostImage } from '../controllers/postController'
import multer from 'multer'

// Configure multer for post image uploads with increased limit
const postStorage = multer.memoryStorage()
const postUpload = multer({
  storage: postStorage,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

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
router.post('/posts/upload-image', postUpload.single('image'), uploadPostImage)
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
router.post('/guides/upload-image', upload.single('image'), uploadGuideImage)

// Settings Management
router.get('/settings', getSettings)
router.put('/settings', updateSettings)

// Email Management
router.post('/test-email', sendTestEmail)

// Email Templates Management
router.get('/email-templates', getEmailTemplates)
router.get('/email-templates/:id', getEmailTemplate)
router.put('/email-templates/:id', updateEmailTemplate)
router.post('/email-templates', createEmailTemplate)
router.delete('/email-templates/:id', deleteEmailTemplate)

export default router
