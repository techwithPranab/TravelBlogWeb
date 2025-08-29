import { Request, Response } from 'express'
import Destination from '../models/Destination'
import { handleAsync } from '../utils/handleAsync'

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
export const getAllDestinations = handleAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, country, region, difficulty, isPopular, isFeatured } = req.query

  // Build filter object
  const filter: any = { isActive: true }
  
  if (country) filter.country = country
  if (region) filter.region = region
  if (difficulty) filter.difficulty = difficulty
  if (isPopular) filter.isPopular = isPopular === 'true'
  if (isFeatured) filter.isFeatured = isFeatured === 'true'

  const destinations = await Destination.find(filter)
    .populate('posts guides')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit))

  const total = await Destination.countDocuments(filter)

  res.status(200).json({
    success: true,
    count: destinations.length,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    },
    data: destinations
  })
})

// @desc    Get featured destinations
// @route   GET /api/destinations/featured
// @access  Public
export const getFeaturedDestinations = handleAsync(async (req: Request, res: Response) => {
  const destinations = await Destination.find({ 
    isActive: true, 
    isFeatured: true 
  })
    .populate('posts guides')
    .sort({ createdAt: -1 })
    .limit(6)

  res.status(200).json({
    success: true,
    count: destinations.length,
    data: destinations
  })
})

// @desc    Get popular destinations
// @route   GET /api/destinations/popular
// @access  Public
export const getPopularDestinations = handleAsync(async (req: Request, res: Response) => {
  const destinations = await Destination.find({ 
    isActive: true, 
    isPopular: true 
  })
    .populate('posts guides')
    .sort({ 'rating.average': -1 })
    .limit(10)

  res.status(200).json({
    success: true,
    count: destinations.length,
    data: destinations
  })
})

// @desc    Get single destination by slug
// @route   GET /api/destinations/:slug
// @access  Public
export const getDestinationBySlug = handleAsync(async (req: Request, res: Response) => {
  const destination = await Destination.findOne({ 
    slug: req.params.slug, 
    isActive: true 
  })
    .populate({
      path: 'posts',
      match: { status: 'published' },
      options: { sort: { publishedAt: -1 } }
    })
    .populate({
      path: 'guides',
      match: { isPublished: true },
      options: { sort: { createdAt: -1 } }
    })

  if (!destination) {
    return res.status(404).json({
      success: false,
      error: 'Destination not found'
    })
  }

  res.status(200).json({
    success: true,
    data: destination
  })
})

// @desc    Create new destination
// @route   POST /api/destinations
// @access  Private/Admin
export const createDestination = handleAsync(async (req: Request, res: Response) => {
  const destination = await Destination.create(req.body)

  res.status(201).json({
    success: true,
    data: destination
  })
})

// @desc    Update destination
// @route   PUT /api/destinations/:id
// @access  Private/Admin
export const updateDestination = handleAsync(async (req: Request, res: Response) => {
  const destination = await Destination.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  )

  if (!destination) {
    return res.status(404).json({
      success: false,
      error: 'Destination not found'
    })
  }

  res.status(200).json({
    success: true,
    data: destination
  })
})

// @desc    Delete destination
// @route   DELETE /api/destinations/:id
// @access  Private/Admin
export const deleteDestination = handleAsync(async (req: Request, res: Response) => {
  const destination = await Destination.findById(req.params.id)

  if (!destination) {
    return res.status(404).json({
      success: false,
      error: 'Destination not found'
    })
  }

  await destination.deleteOne()

  res.status(200).json({
    success: true,
    data: {}
  })
})
