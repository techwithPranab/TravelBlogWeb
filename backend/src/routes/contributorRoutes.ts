import { Router } from 'express'
import { protect, restrictTo } from '../middleware/auth'
import {
  getContributorPosts,
  createContributorPost,
  updateContributorPost,
  deleteContributorPost,
  getContributorDashboard,
  uploadContributorImage
} from '../controllers/contributorController'
import multer from 'multer'

const router = Router()

// Configure multer for image uploads
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

// All routes require authentication and contributor role
router.use(protect)
router.use(restrictTo('admin', 'contributor'))

// Dashboard
router.get('/dashboard', getContributorDashboard)

// Post management
router.get('/posts', getContributorPosts)
router.post('/posts', createContributorPost)
router.put('/posts/:id', updateContributorPost)
router.delete('/posts/:id', deleteContributorPost)

// Image upload
router.post('/upload-image', upload.single('image'), uploadContributorImage)

export default router
