import express from 'express'
import { 
  getAllCategories, 
  getCategoryBySlug, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categoryController'
import { protect, restrictTo } from '../middleware/auth'

const router = express.Router()

// Public routes
router.get('/', getAllCategories)
router.get('/:slug', getCategoryBySlug)

// Protected routes (admin only)
router.use(protect)
router.use(restrictTo('admin'))

router.post('/', createCategory)
router.put('/:id', updateCategory)
router.delete('/:id', deleteCategory)

export default router
