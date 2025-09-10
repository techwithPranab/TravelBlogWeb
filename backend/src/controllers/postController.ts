import { Request, Response } from 'express'
import Post from '@/models/Post'
import { IUser } from '@/models/User'
import { uploadBufferToCloudinary } from '@/config/drive'
import sharp from 'sharp'

interface AuthenticatedRequest extends Request {
  user?: IUser
}

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const sort = req.query.sort as string || '-createdAt'
    const category = req.query.category as string
    const search = req.query.search as string
    const tags = req.query.tags as string
    const status = req.query.status as string || 'published'

    // Build query
    const query: any = { status }

    if (category) {
      query.category = category
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    }

    if (tags) {
      const tagArray = tags.split(',')
      query.tags = { $in: tagArray }
    }

    const skip = (page - 1) * limit

    const posts = await Post.find(query)
      .populate('author', 'name avatar email')
      .sort(sort)
      .skip(skip)
      .limit(limit)

    const total = await Post.countDocuments(query)

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: posts
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Get single post
// @route   GET /api/posts/:identifier
// @access  Public
export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.params

    // Check if identifier is a valid ObjectId
    const isValidObjectId = /^[a-f\d]{24}$/i.test(identifier)

    let query: any = { status: 'published' }

    if (isValidObjectId) {
      // If it's a valid ObjectId, search by _id
      query._id = identifier
    } else {
      // If it's not a valid ObjectId, search by slug
      query.slug = identifier
    }

    const post = await Post.findOne(query)
      .populate('author', 'name avatar email bio socialLinks')
      .populate('categories', 'name slug')

    if (!post) {
      res.status(404).json({
        success: false,
        error: 'Post not found'
      })
      return
    }

    // Increment view count
    post.viewCount = (post.viewCount || 0) + 1
    await post.save()

    res.status(200).json({
      success: true,
      data: post
    })
  } catch (error: any) {
    console.error('Error in getPost:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Create new post
// @route   POST /api/posts
// @access  Private (Author/Admin)
export const createPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Add author to req.body
    req.body.author = req.user?._id

    const post = await Post.create(req.body)

    res.status(201).json({
      success: true,
      data: post
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private (Author/Admin)
export const updatePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let post = await Post.findById(req.params.id)

    if (!post) {
      res.status(404).json({
        success: false,
        error: 'Post not found'
      })
      return
    }

    // Make sure user is post owner or admin
    if (post.author.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      res.status(401).json({
        success: false,
        error: 'Not authorized to update this post'
      })
      return
    }

    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      data: post
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (Author/Admin)
export const deletePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      res.status(404).json({
        success: false,
        error: 'Post not found'
      })
      return
    }

    // Make sure user is post owner or admin
    if (post.author.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      res.status(401).json({
        success: false,
        error: 'Not authorized to delete this post'
      })
      return
    }

    await post.deleteOne()

    res.status(200).json({
      success: true,
      data: {}
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Like/Unlike post
// @route   PUT /api/posts/:id/like
// @access  Private
export const likePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      res.status(404).json({
        success: false,
        error: 'Post not found'
      })
      return
    }

    const userId = req.user?._id?.toString()
    const likeIndex = post.likes.findIndex(like => like.toString() === userId)

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1)
    } else {
      // Like
      post.likes.push(req.user?._id as any)
    }

    await post.save()

    res.status(200).json({
      success: true,
      data: {
        likes: post.likes.length,
        liked: likeIndex === -1
      }
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      res.status(404).json({
        success: false,
        error: 'Post not found'
      })
      return
    }

    const comment = {
      user: req.user?._id,
      content: req.body.content,
      createdAt: new Date()
    }

    post.comments.push(comment as any)
    await post.save()

    // Populate the new comment
    await post.populate('comments.user', 'name avatar')

    res.status(201).json({
      success: true,
      data: post.comments[post.comments.length - 1]
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Get posts by category
// @route   GET /api/posts/category/:category
// @access  Public
export const getPostsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const posts = await Post.find({ 
      category: req.params.category,
      status: 'published'
    })
      .populate('author', 'name avatar email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)

    const total = await Post.countDocuments({ 
      category: req.params.category,
      status: 'published'
    })

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: posts
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Get featured posts
// @route   GET /api/posts/featured
// @access  Public
export const getFeaturedPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 6

    const posts = await Post.find({
      isFeatured: true,
      status: 'published'
    })
      .populate('author', 'name avatar email')
      .sort('-createdAt')
      .limit(limit)

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Get popular posts
// @route   GET /api/posts/popular
// @access  Public
export const getPopularPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 6

    const posts = await Post.find({
      status: 'published'
    })
      .populate('author', 'name avatar email')
      .sort('-views -likes')
      .limit(limit)

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Upload image for blog post
// @route   POST /api/posts/upload-image
// @access  Private
export const uploadPostImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No image file provided'
      })
      return
    }

    // Process image with sharp
    const processedImage = await sharp(req.file.buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer()

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = req.file.originalname.replace(/\.[^/.]+$/, "")
    const fileName = `TravelBlog/posts/${timestamp}-${originalName}.jpg`

    // Upload to Cloudinary
    const result = await uploadBufferToCloudinary(processedImage, fileName, 'TravelBlog/posts')

    res.status(200).json({
      success: true,
      data: {
        url: result.url,
        publicId: result.public_id
      }
    })
  } catch (error: any) {
    console.error('Error uploading post image:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload image'
    })
  }
}
