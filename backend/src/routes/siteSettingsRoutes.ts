import { Router } from 'express'
import { getSiteSettings } from '../controllers/siteSettingsController'

const router = Router()

// Public route to get site settings (for homepage feature toggles)
router.get('/', getSiteSettings)

export default router
