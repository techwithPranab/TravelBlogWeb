import { Request, Response } from 'express'
import Destination from '../models/Destination'
import { handleAsync } from '../utils/handleAsync'
import multer from 'multer'
import sharp from 'sharp'
import { uploadBufferToCloudinary } from '../config/drive'

// Configure multer for memory storage
const storage = multer.memoryStorage()
export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
export const getAllDestinations = handleAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, country, continent, isPopular, isFeatured, search } = req.query

  // Build filter object - only show published destinations to public
  const filter: any = { 
    isActive: true,
    status: 'published' 
  }

  if (country) filter.country = country
  if (continent) filter.continent = continent
  if (isPopular) filter.isPopular = isPopular === 'true'
  if (isFeatured) filter.isFeatured = isFeatured === 'true'
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { country: { $regex: search, $options: 'i' } },
      { continent: { $regex: search, $options: 'i' } },
      { highlights: { $in: [new RegExp(search as string, 'i')] } }
    ]
  }

  const destinations = await Destination.find(filter)
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
    isFeatured: true,
    status: 'published'
  })
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
    isPopular: true,
    status: 'published'
  })
    .sort({ rating: -1 })
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
    isActive: true,
    status: 'published'
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

// @desc    Get single destination by ID (Admin)
// @route   GET /api/destinations/admin/:id
// @access  Private/Admin
export const getDestinationById = handleAsync(async (req: Request, res: Response) => {
  const destination = await Destination.findById(req.params.id)

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

// @desc    Upload destination image
// @route   POST /api/destinations/upload-image
// @access  Private/Admin
export const uploadDestinationImage = handleAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Please upload an image file'
    })
  }

  try {
    // Process image with sharp
    const processedImage = await sharp(req.file.buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer()

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = req.file.originalname.replace(/\.[^/.]+$/, "")
    const filename = `TravelBlog/destinations/${timestamp}-${originalName}.jpg`

    // Upload to Cloudinary
    const result = await uploadBufferToCloudinary(processedImage, filename, 'TravelBlog/destinations')

    res.status(200).json({
      success: true,
      data: {
        url: result.url,
        alt: req.file.originalname,
        public_id: result.public_id
      }
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    })
  }
})
