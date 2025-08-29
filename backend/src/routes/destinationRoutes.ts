import express from 'express'
import { 
  getAllDestinations, 
  getDestinationBySlug, 
  createDestination, 
  updateDestination, 
  deleteDestination,
  getFeaturedDestinations,
  getPopularDestinations 
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

router.post('/', createDestination)
router.put('/:id', updateDestination)
router.delete('/:id', deleteDestination)

export default router
