import { Request, Response } from 'express'
import Guide from '../models/Guide'
import { handleAsync } from '../utils/handleAsync'

// @desc    Get all guides
// @route   GET /api/guides
// @access  Public
export const getAllGuides = handleAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, type, difficulty, destination, category } = req.query

  // Build filter object
  const filter: any = { isPublished: true }
  
  if (type) filter.type = type
  if (difficulty) filter.difficulty = difficulty
  if (destination) filter.destination = destination
  if (category) filter.category = category

  const guides = await Guide.find(filter)
    .populate('author', 'name avatar')
    .populate('destination', 'name slug')
    .populate('category', 'name slug')
    .sort({ publishedAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit))

  const total = await Guide.countDocuments(filter)

  res.status(200).json({
    success: true,
    count: guides.length,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    },
    data: guides
  })
})

// @desc    Get featured guides
// @route   GET /api/guides/featured
// @access  Public
export const getFeaturedGuides = handleAsync(async (req: Request, res: Response) => {
  const guides = await Guide.find({ 
    isPublished: true, 
    isFeatured: true 
  })
    .populate('author', 'name avatar')
    .populate('destination', 'name slug')
    .populate('category', 'name slug')
    .sort({ publishedAt: -1 })
    .limit(6)

  res.status(200).json({
    success: true,
    count: guides.length,
    data: guides
  })
})

// @desc    Get guides by destination
// @route   GET /api/guides/destination/:destinationId
// @access  Public
export const getGuidesByDestination = handleAsync(async (req: Request, res: Response) => {
  const guides = await Guide.find({ 
    destination: req.params.destinationId,
    isPublished: true 
  })
    .populate('author', 'name avatar')
    .populate('category', 'name slug')
    .sort({ publishedAt: -1 })

  res.status(200).json({
    success: true,
    count: guides.length,
    data: guides
  })
})

// @desc    Get guides by type
// @route   GET /api/guides/type/:type
// @access  Public
export const getGuidesByType = handleAsync(async (req: Request, res: Response) => {
  const guides = await Guide.find({ 
    type: req.params.type,
    isPublished: true 
  })
    .populate('author', 'name avatar')
    .populate('destination', 'name slug')
    .populate('category', 'name slug')
    .sort({ publishedAt: -1 })

  res.status(200).json({
    success: true,
    count: guides.length,
    data: guides
  })
})

// @desc    Get single guide by slug
// @route   GET /api/guides/:slug
// @access  Public
export const getGuideBySlug = handleAsync(async (req: Request, res: Response) => {
  const guide = await Guide.findOne({ 
    slug: req.params.slug, 
    isPublished: true 
  })
    .populate('author', 'name avatar bio')
    .populate('destination', 'name slug images')
    .populate('category', 'name slug')
    .populate({
      path: 'comments',
      match: { isApproved: true },
      populate: {
        path: 'author',
        select: 'name avatar'
      }
    })

  if (!guide) {
    return res.status(404).json({
      success: false,
      error: 'Guide not found'
    })
  }

  // Increment views
  guide.views += 1
  await guide.save()

  res.status(200).json({
    success: true,
    data: guide
  })
})

// @desc    Create new guide
// @route   POST /api/guides
// @access  Private/Admin/Contributor
export const createGuide = handleAsync(async (req: Request, res: Response) => {
  // Add user as author
  req.body.author = (req as any).user._id

  const guide = await Guide.create(req.body)

  res.status(201).json({
    success: true,
    data: guide
  })
})

// @desc    Update guide
// @route   PUT /api/guides/:id
// @access  Private/Admin/Contributor
export const updateGuide = handleAsync(async (req: Request, res: Response) => {
  let guide = await Guide.findById(req.params.id)

  if (!guide) {
    return res.status(404).json({
      success: false,
      error: 'Guide not found'
    })
  }

  // Check if user is guide owner or admin
  if (guide.author.toString() !== (req as any).user._id.toString() && (req as any).user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this guide'
    })
  }

  guide = await Guide.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  )

  res.status(200).json({
    success: true,
    data: guide
  })
})

// @desc    Delete guide
// @route   DELETE /api/guides/:id
// @access  Private/Admin
export const deleteGuide = handleAsync(async (req: Request, res: Response) => {
  const guide = await Guide.findById(req.params.id)

  if (!guide) {
    return res.status(404).json({
      success: false,
      error: 'Guide not found'
    })
  }

  await guide.deleteOne()

  res.status(200).json({
    success: true,
    data: {}
  })
})
