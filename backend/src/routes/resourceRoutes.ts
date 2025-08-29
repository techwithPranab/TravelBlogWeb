import express from 'express'
import { 
  getAllResources, 
  getResourceBySlug, 
  createResource, 
  updateResource, 
  deleteResource,
  getResourcesByCategory,
  getFeaturedResources,
  trackResourceClick 
} from '../controllers/resourceController'
import { protect, restrictTo } from '../middleware/auth'

const router = express.Router()

// Public routes
router.get('/', getAllResources)
router.get('/featured', getFeaturedResources)
router.get('/category/:category', getResourcesByCategory)
router.get('/:slug', getResourceBySlug)
router.post('/:id/click', trackResourceClick)

// Protected routes
router.use(protect)

router.post('/', restrictTo('admin', 'contributor'), createResource)
router.put('/:id', restrictTo('admin', 'contributor'), updateResource)
router.delete('/:id', restrictTo('admin'), deleteResource)

export default router
