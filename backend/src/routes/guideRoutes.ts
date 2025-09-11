import express from 'express'
import { 
  getAllGuides, 
  getGuideBySlug, 
  createGuide, 
  updateGuide, 
  deleteGuide,
  getFeaturedGuides,
  getGuidesByDestination,
  getGuidesByType,
  uploadGuideImage,
  upload
} from '../controllers/guideController'
import { protect, restrictTo } from '../middleware/auth'

const router = express.Router()

// Public routes
router.get('/', getAllGuides)
router.get('/featured', getFeaturedGuides)
router.get('/destination/:destinationId', getGuidesByDestination)
router.get('/type/:type', getGuidesByType)
router.get('/:slug', getGuideBySlug)

// Protected routes
router.use(protect)

router.post('/', restrictTo('admin', 'contributor'), createGuide)
router.put('/:id', restrictTo('admin', 'contributor'), updateGuide)
router.delete('/:id', restrictTo('admin'), deleteGuide)

// Image upload route
router.post('/upload-image', protect, restrictTo('admin', 'contributor'), upload.single('image'), uploadGuideImage)

export default router
