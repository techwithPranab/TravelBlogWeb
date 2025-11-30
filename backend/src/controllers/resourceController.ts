import { Request, Response } from 'express'
import Resource from '../models/Resource'
import { handleAsync } from '../utils/handleAsync'

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
export const getAllResources = handleAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, category, type, isRecommended, isFeatured } = req.query

  // Build filter object
  const filter: any = { isActive: true }
  
  if (category) filter.category = category
  if (type) filter.type = type
  if (isRecommended) filter.isRecommended = isRecommended === 'true'
  if (isFeatured) filter.isFeatured = isFeatured === 'true'

  const resources = await Resource.find(filter)
    .populate('author', 'name avatar')
    .populate('destinations', 'name slug')
    .sort({ averageRating: -1, createdAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit))

  const total = await Resource.countDocuments(filter)

  res.status(200).json({
    success: true,
    count: resources.length,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    },
    data: {
      resources,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      count: resources.length
    }
  })
})

// @desc    Get featured resources
// @route   GET /api/resources/featured
// @access  Public
export const getFeaturedResources = handleAsync(async (req: Request, res: Response) => {
  const resources = await Resource.find({ 
    isActive: true, 
    isFeatured: true 
  })
    .populate('author', 'name avatar')
    .populate('destinations', 'name slug')
    .sort({ averageRating: -1 })
    .limit(8)

  res.status(200).json({
    success: true,
    count: resources.length,
    data: resources
  })
})

// @desc    Get resources by category
// @route   GET /api/resources/category/:category
// @access  Public
export const getResourcesByCategory = handleAsync(async (req: Request, res: Response) => {
  const resources = await Resource.find({ 
    category: req.params.category,
    isActive: true 
  })
    .populate('author', 'name avatar')
    .populate('destinations', 'name slug')
    .sort({ averageRating: -1, createdAt: -1 })

  res.status(200).json({
    success: true,
    count: resources.length,
    data: resources
  })
})

// @desc    Get single resource by slug
// @route   GET /api/resources/:slug
// @access  Public
export const getResourceBySlug = handleAsync(async (req: Request, res: Response) => {
  const resource = await Resource.findOne({ 
    slug: req.params.slug, 
    isActive: true 
  })
    .populate('author', 'name avatar bio')
    .populate('destinations', 'name slug images')
    .populate({
      path: 'reviews.user',
      select: 'name avatar'
    })

  if (!resource) {
    return res.status(404).json({
      success: false,
      error: 'Resource not found'
    })
  }

  res.status(200).json({
    success: true,
    data: resource
  })
})

// @desc    Track resource click
// @route   POST /api/resources/:id/click
// @access  Public
export const trackResourceClick = handleAsync(async (req: Request, res: Response) => {
  const resource = await Resource.findById(req.params.id)

  if (!resource) {
    return res.status(404).json({
      success: false,
      error: 'Resource not found'
    })
  }

  resource.clickCount += 1
  await resource.save()

  res.status(200).json({
    success: true,
    data: {
      clickCount: resource.clickCount
    }
  })
})

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private/Admin/Contributor
export const createResource = handleAsync(async (req: Request, res: Response) => {
  // Add user as author
  req.body.author = (req as any).user._id

  const resource = await Resource.create(req.body)

  res.status(201).json({
    success: true,
    data: resource
  })
})

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private/Admin/Contributor
export const updateResource = handleAsync(async (req: Request, res: Response) => {
  let resource = await Resource.findById(req.params.id)

  if (!resource) {
    return res.status(404).json({
      success: false,
      error: 'Resource not found'
    })
  }

  // Check if user is resource owner or admin
  if (resource.author.toString() !== (req as any).user._id.toString() && (req as any).user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this resource'
    })
  }

  resource.lastUpdated = new Date()
  
  resource = await Resource.findByIdAndUpdate(
    req.params.id,
    { ...req.body, lastUpdated: new Date() },
    {
      new: true,
      runValidators: true
    }
  )

  res.status(200).json({
    success: true,
    data: resource
  })
})

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private/Admin
export const deleteResource = handleAsync(async (req: Request, res: Response) => {
  const resource = await Resource.findById(req.params.id)

  if (!resource) {
    return res.status(404).json({
      success: false,
      error: 'Resource not found'
    })
  }

  await resource.deleteOne()

  res.status(200).json({
    success: true,
    data: {}
  })
})
