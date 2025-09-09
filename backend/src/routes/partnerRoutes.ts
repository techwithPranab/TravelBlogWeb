import { Router } from 'express'
import {
  createPartner,
  getPartners,
  getPartnerById,
  updatePartnerStatus,
  deletePartner,
  getPartnerStats
} from '../controllers/partnerController'

const router = Router()

// Public routes
router.post('/', createPartner)

// Admin routes (these would typically be protected with authentication middleware)
router.get('/', getPartners)
router.get('/stats', getPartnerStats)
router.get('/:id', getPartnerById)
router.put('/:id/status', updatePartnerStatus)
router.delete('/:id', deletePartner)

export default router
