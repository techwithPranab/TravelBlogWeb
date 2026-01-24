import { Response } from 'express'
import SiteSettings from '../models/SiteSettings'

// @desc    Get public site settings
// @route   GET /api/site-settings
// @access  Public
export const getSiteSettings = async (req: any, res: Response) => {
  try {
    let settings = await SiteSettings.findOne()

    // If no settings exist, create default settings
    if (!settings) {
      settings = await SiteSettings.create({
        siteName: 'BagPackStories',
        siteDescription: 'Discover amazing travel destinations and guides',
        siteUrl: process.env.APP_URL || 'http://localhost:3000',
        contactEmail: process.env.ADMIN_EMAIL || 'admin@bagpackstories.com',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@bagpackstories.com',
        featureToggles: {
          aiItineraryEnabled: false,
          aiItineraryAnnouncementEnabled: true
        }
      })
    }

    // Return only public settings (exclude sensitive data)
    res.json({
      featureToggles: settings.featureToggles,
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      socialLinks: settings.socialLinks
    })
  } catch (error: any) {
    console.error('Get site settings error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch site settings',
      error: error.message
    })
  }
}
