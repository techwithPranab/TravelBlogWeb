import express from 'express'
import {
  getAllDestinations,
  getFeaturedDestinations,
  getPopularDestinations,
  getDestinationBySlug,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
  uploadDestinationImage,
  upload
} from '../controllers/destinationController'
import { protect, restrictTo } from '../middleware/auth'

const router = express.Router()

// Public routes
router.get('/', getAllDestinations)
router.get('/featured', getFeaturedDestinations)
router.get('/popular', getPopularDestinations)
router.get('/:slug', getDestinationBySlug)

// Protected routes (admin only)
router.use(protect)
router.use(restrictTo('admin'))

router.get('/admin/:id', getDestinationById)
router.post('/', createDestination)
router.put('/:id', updateDestination)
router.delete('/:id', deleteDestination)
router.post('/upload-image', upload.single('image'), uploadDestinationImage)

export default router
