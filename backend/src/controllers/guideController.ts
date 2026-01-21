import { Request, Response } from 'express'
import Guide from '../models/Guide'
import { handleAsync } from '../utils/handleAsync'
import { uploadBufferToCloudinary } from '../config/drive'
import multer from 'multer'
import sharp from 'sharp'

// Configure multer for memory storage with increased file size limit
const storage = multer.memoryStorage()
export const upload = multer({ 
  storage,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// @desc    Get all guides
// @route   GET /api/guides
// @access  Public
export const getAllGuides = handleAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, type, difficulty, destination, category, search } = req.query

  // Build filter object
  const filter: any = { isPublished: true }

  if (type) filter.type = type
  if (difficulty) filter.difficulty = difficulty
  if (destination) filter['destination.slug'] = destination
  if (category) filter.category = category
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search as string, 'i')] } },
      { type: { $regex: search, $options: 'i' } },
      { difficulty: { $regex: search, $options: 'i' } }
    ]
  }

  const guides = await Guide.find(filter)
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
    rating: { $gte: 4.5 }
  })
    .sort({ rating: -1, totalReviews: -1 })
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
    'destination.slug': req.params.destinationId,
    isPublished: true
  })
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

  if (!guide) {
    return res.status(404).json({
      success: false,
      error: 'Guide not found'
    })
  }

  // Increment views
  if (guide.views !== undefined) {
    guide.views += 1
    await guide.save()
  }

  res.status(200).json({
    success: true,
    data: guide
  })
})

// @desc    Create new guide
// @route   POST /api/guides
// @access  Private/Admin/Contributor
export const createGuide = handleAsync(async (req: Request, res: Response) => {
  // Add user as embedded author
  req.body.author = {
    name: (req as any).user.name,
    avatar: (req as any).user.avatar || '',
    bio: (req as any).user.bio || ''
  }

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

  // Check if user is admin (author check removed due to embedded structure)
  if ((req as any).user.role !== 'admin') {
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

// @desc    Upload image for guide
// @route   POST /api/guides/upload-image
// @access  Private/Admin
export const uploadGuideImage = handleAsync(async (req: Request, res: Response) => {
  // Check if file was uploaded
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
    const fileName = `BagPackStories/guides/${timestamp}-${originalName}.jpg`

    // Upload to Cloudinary
    const result = await uploadBufferToCloudinary(processedImage, fileName, 'BagPackStories/guides')

    res.status(200).json({
      success: true,
      data: {
        url: result.url,
        public_id: result.public_id
      }
    })
  } catch (error) {
    console.error('Error uploading guide image:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    })
  }
})
