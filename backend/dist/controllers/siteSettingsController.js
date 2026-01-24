"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSiteSettings = void 0;
const SiteSettings_1 = __importDefault(require("../models/SiteSettings"));
// @desc    Get public site settings
// @route   GET /api/site-settings
// @access  Public
const getSiteSettings = async (req, res) => {
    try {
        let settings = await SiteSettings_1.default.findOne();
        // If no settings exist, create default settings
        if (!settings) {
            settings = await SiteSettings_1.default.create({
                siteName: 'BagPackStories',
                siteDescription: 'Discover amazing travel destinations and guides',
                siteUrl: process.env.APP_URL || 'http://localhost:3000',
                contactEmail: process.env.ADMIN_EMAIL || 'admin@bagpackstories.com',
                supportEmail: process.env.SUPPORT_EMAIL || 'support@bagpackstories.com',
                featureToggles: {
                    aiItineraryEnabled: false,
                    aiItineraryAnnouncementEnabled: true
                }
            });
        }
        // Return only public settings (exclude sensitive data)
        res.json({
            featureToggles: settings.featureToggles,
            siteName: settings.siteName,
            siteDescription: settings.siteDescription,
            socialLinks: settings.socialLinks
        });
    }
    catch (error) {
        console.error('Get site settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch site settings',
            error: error.message
        });
    }
};
exports.getSiteSettings = getSiteSettings;
