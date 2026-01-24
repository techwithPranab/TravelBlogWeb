import { Request, Response } from 'express'
import User, { IUser } from '@/models/User'
import { AuthenticatedRequest } from '../types/express'

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const sort = req.query.sort as string || '-createdAt'
    const role = req.query.role as string
    const search = req.query.search as string

    // Build query
    const query: any = {}

    if (role) {
      query.role = role
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (page - 1) * limit

    const users = await User.find(query)
      .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken')
      .sort(sort)
      .skip(skip)
      .limit(limit)

    const total = await User.countDocuments(query)

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: users
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Public
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken')

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      })
      return
    }

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.create(req.body)

    res.status(201).json({
      success: true,
      data: user
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      bio: req.body.bio,
      avatar: req.body.avatar,
      socialLinks: req.body.socialLinks,
      isPremium: req.body.isPremium,
      isEmailVerified: req.body.isEmailVerified,
    }

    const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    }).select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken')

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      })
      return
    }

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      })
      return
    }

    await user.deleteOne()

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

// @desc    Upload user avatar
// @route   PUT /api/v1/users/:id/avatar
// @access  Private
export const uploadAvatar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      })
      return
    }

    // Check if user is updating their own avatar or is admin
    if (req.params.id !== req.user?._id?.toString() && req.user?.role !== 'admin') {
      res.status(401).json({
        success: false,
        error: 'Not authorized to update this avatar'
      })
      return
    }

    // Here you would handle file upload (e.g., using multer and cloudinary)
    // For now, we'll just update the avatar URL from the request body
    user.avatar = req.body.avatar
    await user.save()

    res.status(200).json({
      success: true,
      data: {
        avatar: user.avatar
      }
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Follow/Unfollow user
// @route   PUT /api/v1/users/:id/follow
// @access  Private
export const followUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userToFollow = await User.findById(req.params.id)
    const currentUser = await User.findById(req.user?._id)

    if (!userToFollow || !currentUser) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      })
      return
    }

    if (userToFollow._id.toString() === currentUser._id.toString()) {
      res.status(400).json({
        success: false,
        error: 'You cannot follow yourself'
      })
      return
    }

    const isFollowing = currentUser.following.includes(userToFollow._id as any)

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== userToFollow._id.toString()
      )
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== currentUser._id.toString()
      )
    } else {
      // Follow
      currentUser.following.push(userToFollow._id as any)
      userToFollow.followers.push(currentUser._id as any)
    }

    await Promise.all([currentUser.save(), userToFollow.save()])

    res.status(200).json({
      success: true,
      data: {
        following: !isFollowing,
        followersCount: userToFollow.followers.length,
        followingCount: currentUser.following.length
      }
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Get user's followers
// @route   GET /api/v1/users/:id/followers
// @access  Public
export const getUserFollowers = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name avatar bio')

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      })
      return
    }

    res.status(200).json({
      success: true,
      count: user.followers.length,
      data: user.followers
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Get user's following
// @route   GET /api/v1/users/:id/following
// @access  Public
export const getUserFollowing = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'name avatar bio')

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      })
      return
    }

    res.status(200).json({
      success: true,
      count: user.following.length,
      data: user.following
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}

// @desc    Get user statistics
// @route   GET /api/v1/users/:id/stats
// @access  Public
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      })
      return
    }

    // You could add more sophisticated stats here
    // For now, we'll return basic counts
    const stats = {
      followers: user.followers.length,
      following: user.following.length,
      joinedAt: user.createdAt,
      isPremium: user.isPremium,
      role: user.role
    }

    res.status(200).json({
      success: true,
      data: stats
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    })
  }
}
