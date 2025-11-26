import { Request, Response } from 'express'
import User from '../models/User'
import Post from '../models/Post'
import Destination from '../models/Destination'
import Guide from '../models/Guide'
import Newsletter from '../models/Newsletter'
import SiteSettings from '../models/SiteSettings'
import { AuthenticatedRequest } from '../middleware/adminAuth'

// Admin Dashboard Stats
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalPosts,
      totalDestinations,
      totalGuides,
      totalSubscribers,
      pendingPosts,
      recentUsers,
      recentPosts
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Destination.countDocuments(),
      Guide.countDocuments(),
      Newsletter.countDocuments(),
      Post.countDocuments({ status: 'draft' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
      Post.find().sort({ createdAt: -1 }).limit(5).populate('author', 'name').select('title author status createdAt')
    ])

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalPosts,
          totalDestinations,
          totalGuides,
          totalSubscribers,
          pendingPosts
        },
        recentActivity: {
          recentUsers,
          recentPosts
        }
      }
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    })
  }
}

// Users Management
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const search = req.query.search as string
    const role = req.query.role as string

    const query: any = {}
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (role && role !== 'all') {
      query.role = role
    }

    const skip = (page - 1) * limit
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('name email role isEmailVerified isPremium createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ])

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    })
  }
}

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    const user = new User({
      name,
      email,
      password,
      role: role || 'reader',
      isEmailVerified: true
    })

    await user.save()

    const userResponse = await User.findById(user._id).select('-password')

    res.status(201).json({
      success: true,
      data: userResponse,
      message: 'User created successfully'
    })
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    })
  }
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, email, role, isPremium, isEmailVerified } = req.body

    const user = await User.findByIdAndUpdate(
      id,
      { name, email, role, isPremium, isEmailVerified },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    })
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const user = await User.findByIdAndDelete(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    })
  }
}

// Posts Management
export const getAllPostsAdmin = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const search = req.query.search as string
    const status = req.query.status as string
    const category = req.query.category as string

    const query: any = {}
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (status && status !== 'all') {
      query.status = status
    }
    
    if (category && category !== 'all') {
      query.categories = category
    }

    const skip = (page - 1) * limit
    
    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'name email')
        .populate('categories', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(query)
    ])

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    })
  } catch (error) {
    console.error('Get posts admin error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts'
    })
  }
}

export const updatePostStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const post = await Post.findByIdAndUpdate(
      id,
      { 
        status,
        publishedAt: status === 'published' ? new Date() : undefined
      },
      { new: true }
    ).populate('author', 'name email')

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }

    res.json({
      success: true,
      data: post,
      message: 'Post status updated successfully'
    })
  } catch (error) {
    console.error('Update post status error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update post status'
    })
  }
}

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const post = await Post.findByIdAndDelete(id)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }

    res.json({
      success: true,
      message: 'Post deleted successfully'
    })
  } catch (error) {
    console.error('Delete post error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    })
  }
}

// Create new post
export const createPost = async (req: Request, res: Response) => {
  try {
    const postData = {
      ...req.body,
      author: req.body.author || '64b1234567890abcdef123456' // Default author ID
    }

    const post = new Post(postData)
    await post.save()
    await post.populate('author', 'name email')

    res.status(201).json({
      success: true,
      data: post,
      message: 'Post created successfully'
    })
  } catch (error) {
    console.error('Create post error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    })
  }
}

// Update post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    console.log('Update post request body:', req.body)
    console.log('isFeatured value:', req.body.isFeatured)
    console.log('isFeatured type:', typeof req.body.isFeatured)

    // Prepare update data
    const updateData = { ...req.body }
    
    // Ensure isFeatured is boolean
    if (updateData.isFeatured !== undefined) {
      updateData.isFeatured = Boolean(updateData.isFeatured)
    }

    console.log('Update data:', updateData)

    const post = await Post.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: false } // Disable validators for now to avoid issues
    ).populate('author', 'name email')
     .populate('categories', 'name slug')

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }

    console.log('Updated post isFeatured:', post.isFeatured)

    res.json({
      success: true,
      data: post,
      message: 'Post updated successfully'
    })
  } catch (error) {
    console.error('Update post error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update post'
    })
  }
}// Get single post
export const getPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const post = await Post.findById(id)
      .populate('author', 'name email')
      .populate('categories', 'name slug')
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }

    res.json({
      success: true,
      data: post
    })
  } catch (error) {
    console.error('Get post error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get post'
    })
  }
}

// Approve post
export const approvePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const post = await Post.findByIdAndUpdate(
      id,
      { 
        status: 'published',
        publishedAt: new Date()
      },
      { new: true }
    ).populate('author', 'name email')

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }

    res.json({
      success: true,
      data: post,
      message: 'Post approved and published successfully'
    })
  } catch (error) {
    console.error('Approve post error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to approve post'
    })
  }
}

// Get pending posts for moderation
export const getPendingPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    const [posts, total] = await Promise.all([
      Post.find({ status: 'pending' })
        .populate('author', 'name email')
        .populate('categories', 'name slug')
        .populate('moderatedBy', 'name email')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ status: 'pending' })
    ])

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    })
  } catch (error) {
    console.error('Get pending posts error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending posts'
    })
  }
}

// Moderate post (approve/reject)
export const moderatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, moderationNotes } = req.body
    const adminId = (req as any).user?.id

    if (!['published', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either published or rejected'
      })
    }

    const updateData: any = {
      status,
      moderationNotes,
      moderatedBy: adminId,
      moderatedAt: new Date()
    }

    if (status === 'published') {
      updateData.publishedAt = new Date()
    }

    const post = await Post.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('author', 'name email')
     .populate('moderatedBy', 'name email')

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }

    res.json({
      success: true,
      data: post,
      message: `Post ${status === 'published' ? 'approved' : 'rejected'} successfully`
    })
  } catch (error) {
    console.error('Moderate post error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to moderate post'
    })
  }
}

// Submit post for review (change status from draft to pending)
export const submitPostForReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const post = await Post.findByIdAndUpdate(
      id,
      { 
        status: 'pending',
        submittedAt: new Date()
      },
      { new: true }
    ).populate('author', 'name email')

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }

    res.json({
      success: true,
      data: post,
      message: 'Post submitted for review successfully'
    })
  } catch (error) {
    console.error('Submit post for review error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit post for review'
    })
  }
}

// Destinations Management
export const getAllDestinationsAdmin = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const search = req.query.search as string

    const query: any = {}
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { region: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (page - 1) * limit
    
    const [destinations, total] = await Promise.all([
      Destination.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Destination.countDocuments(query)
    ])

    res.json({
      success: true,
      data: destinations,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    })
  } catch (error) {
    console.error('Get destinations admin error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch destinations'
    })
  }
}

export const deleteDestination = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const destination = await Destination.findByIdAndDelete(id)
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      })
    }

    res.json({
      success: true,
      message: 'Destination deleted successfully'
    })
  } catch (error) {
    console.error('Delete destination error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete destination'
    })
  }
}

// Create new destination
export const createDestination = async (req: Request, res: Response) => {
  try {
    const destination = new Destination(req.body)
    await destination.save()

    res.status(201).json({
      success: true,
      data: destination,
      message: 'Destination created successfully'
    })
  } catch (error) {
    console.error('Create destination error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create destination'
    })
  }
}

// Update destination
export const updateDestination = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const destination = await Destination.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      })
    }

    res.json({
      success: true,
      data: destination,
      message: 'Destination updated successfully'
    })
  } catch (error) {
    console.error('Update destination error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update destination'
    })
  }
}

// Get single destination
export const getDestination = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const destination = await Destination.findById(id)
    
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      })
    }

    res.json({
      success: true,
      data: destination
    })
  } catch (error) {
    console.error('Get destination error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get destination'
    })
  }
}

// Guides Management
export const getAllGuidesAdmin = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const search = req.query.search as string

    const query: any = {}
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (page - 1) * limit
    
    const [guides, total] = await Promise.all([
      Guide.find(query)
        .populate('author', 'name email')
        .populate('destination', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Guide.countDocuments(query)
    ])

    res.json({
      success: true,
      data: guides,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    })
  } catch (error) {
    console.error('Get guides admin error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guides'
    })
  }
}

export const deleteGuide = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const guide = await Guide.findByIdAndDelete(id)
    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      })
    }

    res.json({
      success: true,
      message: 'Guide deleted successfully'
    })
  } catch (error) {
    console.error('Delete guide error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete guide'
    })
  }
}

// Create new guide
export const createGuide = async (req: Request, res: Response) => {
  try {
    const guide = new Guide(req.body)
    await guide.save()

    res.status(201).json({
      success: true,
      data: guide,
      message: 'Guide created successfully'
    })
  } catch (error) {
    console.error('Create guide error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create guide'
    })
  }
}

// Update guide
export const updateGuide = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const guide = await Guide.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      })
    }

    res.json({
      success: true,
      data: guide,
      message: 'Guide updated successfully'
    })
  } catch (error) {
    console.error('Update guide error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update guide'
    })
  }
}

// Get single guide
export const getGuide = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const guide = await Guide.findById(id)
    
    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      })
    }

    res.json({
      success: true,
      data: guide
    })
  } catch (error) {
    console.error('Get guide error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get guide'
    })
  }
}

// Settings Management
export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await SiteSettings.findOne()
    
    if (!settings) {
      // Create default settings if none exist
      settings = new SiteSettings({
        siteName: 'BagPackStories',
        siteDescription: 'Discover amazing travel destinations and guides',
        siteUrl: 'https://yourdomain.com',
        contactEmail: 'contact@example.com',
        supportEmail: 'support@example.com',
        contactPhone: '+1 (555) 123-4567',
        contactAddress: {
          street: '123 Travel Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'USA'
        },
        businessHours: {
          monday: '9:00 AM - 6:00 PM',
          tuesday: '9:00 AM - 6:00 PM',
          wednesday: '9:00 AM - 6:00 PM',
          thursday: '9:00 AM - 6:00 PM',
          friday: '9:00 AM - 6:00 PM',
          saturday: '10:00 AM - 4:00 PM',
          sunday: 'Closed'
        },
        supportSettings: {
          email: 'support@bagpackstories.in',
          responseTime: 'Within 24 hours'
        },
        socialLinks: {
          facebook: '',
          twitter: '',
          instagram: '',
          youtube: '',
          linkedin: ''
        },
        seoSettings: {
          metaTitle: 'BagPackStories - Discover Amazing Destinations',
          metaDescription: 'Discover amazing travel destinations, guides, and tips from experienced travelers around the world.',
          metaKeywords: []
        },
        emailSettings: {
          fromEmail: 'noreply@example.com',
          fromName: 'BagPackStories'
        },
        generalSettings: {
          postsPerPage: 12,
          commentsEnabled: true,
          registrationEnabled: true,
          maintenanceMode: false
        },
        theme: {
          primaryColor: '#3B82F6',
          secondaryColor: '#8B5CF6'
        }
      })
      await settings.save()
    }

    res.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Get settings error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    })
  }
}

export const updateSettings = async (req: Request, res: Response) => {
  try {
    let settings = await SiteSettings.findOne()
    
    if (!settings) {
      // Create new settings with complete structure if none exist
      const defaultSettings = {
        siteName: 'BagPackStories',
        siteDescription: 'Discover amazing travel destinations and guides',
        siteUrl: 'https://yourdomain.com',
        contactEmail: 'contact@example.com',
        supportEmail: 'support@example.com',
        contactPhone: '+1 (555) 123-4567',
        contactAddress: {
          street: '123 Travel Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'USA'
        },
        businessHours: {
          monday: '9:00 AM - 6:00 PM',
          tuesday: '9:00 AM - 6:00 PM',
          wednesday: '9:00 AM - 6:00 PM',
          thursday: '9:00 AM - 6:00 PM',
          friday: '9:00 AM - 6:00 PM',
          saturday: '10:00 AM - 4:00 PM',
          sunday: 'Closed'
        },
        supportSettings: {
          email: 'support@bagpackstories.in',
          responseTime: 'Within 24 hours'
        },
        socialLinks: {
          facebook: '',
          twitter: '',
          instagram: '',
          youtube: '',
          linkedin: ''
        },
        seoSettings: {
          metaTitle: 'BagPackStories - Discover Amazing Destinations',
          metaDescription: 'Discover amazing travel destinations, guides, and tips from experienced travelers around the world.',
          metaKeywords: []
        },
        emailSettings: {
          fromEmail: 'noreply@example.com',
          fromName: 'BagPackStories'
        },
        generalSettings: {
          postsPerPage: 12,
          commentsEnabled: true,
          registrationEnabled: true,
          maintenanceMode: false
        },
        theme: {
          primaryColor: '#3B82F6',
          secondaryColor: '#8B5CF6'
        },
        ...req.body
      }
      settings = new SiteSettings(defaultSettings)
    } else {
      // Update existing settings
      Object.assign(settings, req.body)
    }
    
    await settings.save()

    res.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    })
  } catch (error) {
    console.error('Update settings error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    })
  }
}
