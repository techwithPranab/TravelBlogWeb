import { Request, Response } from 'express';
import sharp from 'sharp';
import { handleAsync } from '../utils/handleAsync';
import Post from '../models/Post';
import Photo from '../models/Photo';
import User from '../models/User';
import { uploadBufferToCloudinary, deleteFromCloudinary, getFileIdFromUrl, convertToDownloadUrl } from '../config/drive';

// @desc    Get dashboard data for reader
// @route   GET /api/v1/reader/dashboard
// @access  Private/Reader
export const getReaderDashboard = handleAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  try {
    // Get user's posts stats
    const userPosts = await Post.find({ author: userId }).countDocuments();

    // Get total likes on user's posts
    const totalLikes = await Post.aggregate([
      { $match: { author: userId } },
      { $group: { _id: null, totalLikes: { $sum: { $size: '$likes' } } } }
    ]);

    // Get total comments on user's posts
    const totalComments = await Post.aggregate([
      { $match: { author: userId } },
      { $lookup: { from: 'comments', localField: '_id', foreignField: 'post', as: 'comments' } },
      { $group: { _id: null, totalComments: { $sum: { $size: '$comments' } } } }
    ]);

    // Get total views on user's posts
    const totalViews = await Post.aggregate([
      { $match: { author: userId } },
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ]);

    // Get recent activity (likes, comments on user's posts)
    const recentActivity = [];

    // Get recent likes on user's posts
    const recentLikes = await Post.find({ author: userId })
      .select('title likes')
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('likes', 'name')
      .then(posts => {
        return posts.flatMap(post =>
          post.likes.slice(0, 3).map((liker: any) => ({
            id: `${post._id}-like-${liker._id}`,
            type: 'like' as const,
            message: `${liker.name} liked your post`,
            date: new Date().toISOString().split('T')[0], // Simplified date
            postTitle: post.title
          }))
        );
      });

    // Get recent comments on user's posts
    const recentComments = await Post.aggregate([
      { $match: { author: userId } },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'post',
          as: 'comments'
        }
      },
      { $unwind: '$comments' },
      { $sort: { 'comments.createdAt': -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: 'comments.author',
          foreignField: '_id',
          as: 'commentAuthor'
        }
      },
      { $unwind: '$commentAuthor' },
      {
        $project: {
          id: { $concat: ['comment-', { $toString: '$comments._id' }] },
          type: 'comment',
          message: { $concat: ['$commentAuthor.name', ' commented on your post'] },
          date: { $dateToString: { format: '%Y-%m-%d', date: '$comments.createdAt' } },
          postTitle: '$title'
        }
      }
    ]);

    // Combine and sort recent activity
    recentActivity.push(...recentLikes, ...recentComments);
    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    recentActivity.splice(10); // Keep only 10 most recent

    res.status(200).json({
      success: true,
      data: {
        totalPosts: userPosts,
        totalLikes: totalLikes[0]?.totalLikes || 0,
        totalComments: totalComments[0]?.totalComments || 0,
        totalViews: totalViews[0]?.totalViews || 0,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error fetching reader dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
});

// @desc    Get user profile data
// @route   GET /api/v1/reader/profile
// @access  Private/Reader
export const getReaderProfile = handleAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  try {
    // Get user data
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user's activity stats
    const [postsLiked, photosLiked, totalReadTime] = await Promise.all([
      Post.find({ likes: userId, status: 'published' }).countDocuments(),
      Photo.find({ likes: userId, status: 'approved' }).countDocuments(),
      Post.aggregate([
        { $match: { likes: { $in: [userId] }, status: 'published' } },
        { $group: { _id: null, totalTime: { $sum: '$readTime' } } }
      ])
    ]);

    // Get user's recent activity (liked posts)
    const recentActivity = await Post.find({ 
      likes: userId,
      status: 'published'
    })
      .populate('author', 'name')
      .populate('categories', 'name slug')
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('title slug excerpt featuredImage publishedAt readTime');

    // Get user's favorite categories based on liked posts
    const favoriteCategories = await Post.aggregate([
      { $match: { likes: { $in: [userId] }, status: 'published' } },
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          name: '$category.name',
          slug: '$category.slug',
          count: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          avatar: convertToDownloadUrl(user.avatar),
          stats: {
            postsLiked,
            photosLiked,
            totalReadTime: totalReadTime[0]?.totalTime || 0,
            joinedDate: user.createdAt
          }
        },
        recentActivity,
        favoriteCategories
      }
    });
  } catch (error) {
    console.error('Error fetching reader profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile data'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/v1/reader/profile
// @access  Private/Reader
export const updateReaderProfile = handleAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { name, bio, location, website, socialLinks } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        bio,
        location,
        website,
        socialLinks
      },
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating reader profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// @desc    Upload user avatar
// @route   POST /api/v1/reader/avatar
// @access  Private/Reader
export const uploadReaderAvatar = handleAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Get current user to check if they have an existing avatar
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Delete old avatar from Cloudinary if it exists
    if (currentUser.avatar) {
      try {
        // Try to extract public_id from Cloudinary URL or Google Drive URL
        let publicId = null;
        
        // Check if it's a Cloudinary URL
        const cloudinaryRegex = /\/v\d+\/(.+)\.[a-zA-Z]+$/;
        const cloudinaryMatch = cloudinaryRegex.exec(currentUser.avatar);
        if (cloudinaryMatch) {
          publicId = cloudinaryMatch[1];
        } else {
          // Check if it's a Google Drive URL
          const fileId = getFileIdFromUrl(currentUser.avatar);
          if (fileId) {
            publicId = fileId;
          }
        }
        
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } catch (deleteError) {
        console.warn('Failed to delete old avatar:', deleteError);
        // Continue with upload even if delete fails
      }
    }

    // Process avatar image with sharp
    const processedAvatar = await sharp(req.file.buffer)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Upload new avatar to Cloudinary
    const avatarResult = await uploadBufferToCloudinary(processedAvatar, `avatar-${userId}-${Date.now()}`, 'avatars');
    const avatarUrl = avatarResult.url;

    // Update user with new avatar URL
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar: convertToDownloadUrl(user.avatar)
      }
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload avatar'
    });
  }
});

// @desc    Get user's reading history
// @route   GET /api/v1/reader/history
// @access  Private/Reader
export const getReadingHistory = handleAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { page = 1, limit = 20 } = req.query;

  try {
    const skip = (Number(page) - 1) * Number(limit);

    const [history, total] = await Promise.all([
      Post.find({ 
        likes: userId,
        status: 'published'
      })
        .populate('author', 'name')
        .populate('categories', 'name slug')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('title slug excerpt featuredImage publishedAt readTime viewCount'),
      Post.find({ likes: userId, status: 'published' }).countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: history,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reading history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reading history'
    });
  }
});

// @desc    Get personalized recommendations
// @route   GET /api/v1/reader/recommendations
// @access  Private/Reader
export const getPersonalizedRecommendations = handleAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { limit = 10 } = req.query;

  try {
    // Get user's liked posts to understand preferences
    const likedPosts = await Post.find({ 
      likes: userId,
      status: 'published'
    }).populate('categories', '_id');

    // Extract categories and tags from liked posts
    const likedCategories = likedPosts.flatMap(post => 
      post.categories.map((cat: any) => cat._id)
    );
    
    const likedTags = likedPosts.flatMap(post => post.tags);

    // Build recommendation query
    const recommendationQuery: any = {
      status: 'published',
      _id: { $nin: likedPosts.map(p => p._id) }
    };

    if (likedCategories.length > 0 || likedTags.length > 0) {
      recommendationQuery.$or = [];
      
      if (likedCategories.length > 0) {
        recommendationQuery.$or.push({ categories: { $in: likedCategories } });
      }
      
      if (likedTags.length > 0) {
        recommendationQuery.$or.push({ tags: { $in: likedTags } });
      }
    }

    const recommendations = await Post.find(recommendationQuery)
      .populate('author', 'name')
      .populate('categories', 'name slug')
      .sort({ 
        viewCount: -1, 
        likeCount: -1, 
        publishedAt: -1 
      })
      .limit(Number(limit))
      .select('title slug excerpt featuredImage publishedAt readTime viewCount likeCount');

    // If no personalized recommendations, get popular posts
    if (recommendations.length === 0) {
      const popularPosts = await Post.find({ 
        status: 'published',
        _id: { $nin: likedPosts.map(p => p._id) }
      })
        .populate('author', 'name')
        .populate('categories', 'name slug')
        .sort({ viewCount: -1, likeCount: -1 })
        .limit(Number(limit))
        .select('title slug excerpt featuredImage publishedAt readTime viewCount likeCount');

      return res.status(200).json({
        success: true,
        data: popularPosts,
        type: 'popular'
      });
    }

    res.status(200).json({
      success: true,
      data: recommendations,
      type: 'personalized'
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recommendations'
    });
  }
});
