import { Router } from 'express'
import {
  getSubscriptionStatus,
  upgradeSubscription,
  getUsageStats,
  cancelSubscription
} from '../controllers/subscriptionController'
import { protect } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(protect)

// GET /api/subscriptions/status - Get current subscription status
router.get('/status', getSubscriptionStatus)

// GET /api/subscriptions/usage - Get usage statistics
router.get('/usage', getUsageStats)

// POST /api/subscriptions/upgrade - Upgrade to premium
router.post('/upgrade', upgradeSubscription)

// POST /api/subscriptions/cancel - Cancel subscription
router.post('/cancel', cancelSubscription)

export default router
