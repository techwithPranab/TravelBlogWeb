import { Request, Response, NextFunction } from 'express'
import Advertisement, { AdType, AdFormat, AdPlacement } from '../models/Advertisement'
import adService from '../services/adService'
import mongoose from 'mongoose'

/**
 * Advertisement Controller
 * Handles CRUD operations for advertisements
 */

/**
 * @route   POST /api/advertisements
 * @desc    Create new advertisement
 * @access  Admin
 */
export const createAdvertisement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      })
    }
    
    const advertisementData = {
      ...req.body,
      createdBy: userId
    }
    
    const advertisement = await Advertisement.create(advertisementData)
    
    res.status(201).json({
      success: true,
      data: advertisement,
      message: 'Advertisement created successfully'
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create advertisement'
    })
  }
}

/**
 * @route   GET /api/advertisements
 * @desc    Get all advertisements with pagination and filters
 * @access  Admin
 */
export const getAdvertisements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      format,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query
    
    const query: any = {}
    
    if (status) query.status = status
    if (type) query.type = type
    if (format) query.format = format
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    
    const skip = (Number(page) - 1) * Number(limit)
    const sortOptions: any = {}
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1
    
    const [advertisements, total] = await Promise.all([
      Advertisement.find(query)
        .populate('createdBy', 'name email')
        .populate('targeting.categories', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Advertisement.countDocuments(query)
    ])
    
    res.status(200).json({
      success: true,
      data: {
        advertisements,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch advertisements'
    })
  }
}

/**
 * @route   GET /api/advertisements/:id
 * @desc    Get advertisement by ID
 * @access  Admin
 */
export const getAdvertisementById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('targeting.categories', 'name slug')
      .populate('partner.id', 'firstName lastName company')
    
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: advertisement
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch advertisement'
    })
  }
}

/**
 * @route   PUT /api/advertisements/:id
 * @desc    Update advertisement
 * @access  Admin
 */
export const updateAdvertisement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id
    
    const advertisement = await Advertisement.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: userId
      },
      { new: true, runValidators: true }
    )
    
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: advertisement,
      message: 'Advertisement updated successfully'
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update advertisement'
    })
  }
}

/**
 * @route   DELETE /api/advertisements/:id
 * @desc    Delete advertisement
 * @access  Admin
 */
export const deleteAdvertisement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const advertisement = await Advertisement.findByIdAndDelete(req.params.id)
    
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found'
      })
    }
    
    res.status(200).json({
      success: true,
      message: 'Advertisement deleted successfully'
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete advertisement'
    })
  }
}

/**
 * @route   PATCH /api/advertisements/bulk-status
 * @desc    Update status of multiple advertisements
 * @access  Admin
 */
export const bulkUpdateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ids, status } = req.body
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of advertisement IDs'
      })
    }
    
    if (!['active', 'paused', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      })
    }
    
    const result = await Advertisement.updateMany(
      { _id: { $in: ids } },
      { status, updatedBy: (req as any).user?._id }
    )
    
    res.status(200).json({
      success: true,
      data: {
        modified: result.modifiedCount
      },
      message: `${result.modifiedCount} advertisements updated`
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update advertisements'
    })
  }
}

/**
 * @route   POST /api/advertisements/:id/duplicate
 * @desc    Duplicate an advertisement
 * @access  Admin
 */
export const duplicateAdvertisement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const original = await Advertisement.findById(req.params.id)
    
    if (!original) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found'
      })
    }
    
    const duplicate = new Advertisement({
      ...original.toObject(),
      _id: new mongoose.Types.ObjectId(),
      name: `${original.name} (Copy)`,
      status: 'draft',
      performance: {
        impressions: 0,
        clicks: 0,
        ctr: 0,
        conversions: 0,
        revenue: 0
      },
      createdBy: (req as any).user?._id,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    await duplicate.save()
    
    res.status(201).json({
      success: true,
      data: duplicate,
      message: 'Advertisement duplicated successfully'
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to duplicate advertisement'
    })
  }
}

/**
 * @route   GET /api/advertisements/active
 * @desc    Get active advertisements (public)
 * @access  Public
 */
export const getActiveAds = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, format, limit = 10 } = req.query
    
    const query: any = { status: 'active' }
    if (type) query.type = type
    if (format) query.format = format
    
    const ads = await Advertisement.find(query)
      .select('-notes -createdBy -updatedBy')
      .limit(Number(limit))
    
    res.status(200).json({
      success: true,
      data: ads
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch active ads'
    })
  }
}

/**
 * @route   GET /api/advertisements/placement/:position
 * @desc    Get advertisements for specific placement
 * @access  Public
 */
export const getAdsForPlacement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { position } = req.params
    const { blogPostId, categoryIds, tags, deviceType = 'desktop' } = req.query
    
    // Get session ID from cookie or generate new one
    const sessionId = req.cookies?.sessionId || `session_${Date.now()}`
    
    const context = {
      blogPostId: blogPostId as string,
      categoryIds: categoryIds
        ? (categoryIds as string).split(',')
        : [],
      tags: tags ? (tags as string).split(',') : [],
      sessionId,
      deviceType: deviceType as 'desktop' | 'mobile' | 'tablet',
      userId: (req as any).user?._id?.toString()
    }
    
    const ad = await adService.selectAdForPlacement(
      position as AdPlacement,
      context
    )
    
    if (!ad) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No ad available for this placement'
      })
    }
    
    // Return ad without sensitive information
    const adData = {
      _id: ad._id,
      name: ad.name,
      title: ad.title,
      type: ad.type,
      format: ad.format,
      creative: ad.creative,
      destinationUrl: ad.destinationUrl,
      utmParameters: ad.utmParameters,
      isSponsored: ad.isSponsored,
      seo: ad.seo
    }
    
    res.status(200).json({
      success: true,
      data: adData
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch ads for placement'
    })
  }
}

/**
 * @route   GET /api/advertisements/blog/:blogId
 * @desc    Get all ads for a specific blog post
 * @access  Public
 */
export const getAdsForBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { blogId } = req.params
    const { deviceType = 'desktop' } = req.query
    
    // This would be implemented with placement config
    // For now, return empty array
    res.status(200).json({
      success: true,
      data: [],
      message: 'Blog post ads will be available after placement configuration'
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch blog post ads'
    })
  }
}

/**
 * @route   GET /api/advertisements/stats/overview
 * @desc    Get advertisement statistics overview
 * @access  Admin
 */
export const getStatsOverview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [
      totalAds,
      activeAds,
      totalImpressions,
      totalClicks,
      topPerformers
    ] = await Promise.all([
      Advertisement.countDocuments(),
      Advertisement.countDocuments({ status: 'active' }),
      Advertisement.aggregate([
        { $group: { _id: null, total: { $sum: '$performance.impressions' } } }
      ]),
      Advertisement.aggregate([
        { $group: { _id: null, total: { $sum: '$performance.clicks' } } }
      ]),
      adService.getTopPerformingAds(5)
    ])
    
    const impressions = totalImpressions[0]?.total || 0
    const clicks = totalClicks[0]?.total || 0
    const avgCTR = impressions > 0 ? (clicks / impressions) * 100 : 0
    
    res.status(200).json({
      success: true,
      data: {
        totalAds,
        activeAds,
        totalImpressions: impressions,
        totalClicks: clicks,
        avgCTR: parseFloat(avgCTR.toFixed(2)),
        topPerformers
      }
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch statistics'
    })
  }
}
