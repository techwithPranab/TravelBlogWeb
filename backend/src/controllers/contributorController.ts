import { Request, Response } from 'express'
import Post from '../models/Post'
import { handleAsync } from '../utils/handleAsync'
import { uploadBufferToCloudinary } from '../config/drive'
import sharp from 'sharp'
import { emailService } from '../services/emailService'
import { AuthenticatedRequest } from '../types/express'

// Helper function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove all non-word chars except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores and multiple hyphens with single hyphen
    .replace(/(^-+|-+$)/g, '') // Remove leading/trailing hyphens
}

// @desc    Get contributor's own posts
// @route   GET /api/contributor/posts
// @access  Private/Contributor
export const getContributorPosts = handleAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id
  const { page = 1, limit = 10, status } = req.query

  const query: any = { author: userId }

  if (status && status !== 'all') {
    query.status = status
  }

  const skip = (Number(page) - 1) * Number(limit)

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate('categories', 'name slug')
      .populate('moderatedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Post.countDocuments(query)
  ])

  // Get status counts for contributor dashboard
  const statusCounts = await Post.aggregate([
    { $match: { author: userId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ])

  const statusSummary = {
    draft: 0,
    pending: 0,
    published: 0,
    rejected: 0,
    archived: 0,
    inactive: 0
  }

  statusCounts.forEach(item => {
    statusSummary[item._id as keyof typeof statusSummary] = item.count
  })

  res.status(200).json({
    success: true,
    data: posts,
    pagination: {
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
      limit: Number(limit)
    },
    statusCounts: statusSummary
  })
})

// @desc    Create new post (as contributor)
// @route   POST /api/contributor/posts
// @access  Private/Contributor
export const createContributorPost = handleAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id

  // Generate slug from title
  const slug = generateSlug(req.body.title)

  // Ensure slug is unique by checking existing posts
  let uniqueSlug = slug
  let counter = 1
  while (await Post.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${slug}-${counter}`
    counter++
  }

  // Filter out empty content sections before creating the post
  const filteredContentSections = req.body.contentSections?.filter((section: any) => {
    // Keep image-only sections (they don't require content)
    if (section.type === 'image-only') {
      return true
    }
    // For text and image-text sections, ensure content is not empty
    return section.content && section.content.trim() !== ''
  }) || []

  // Set default status for contributors
  const postData = {
    ...req.body,
    contentSections: filteredContentSections,
    slug: uniqueSlug,
    author: userId,
    status: 'pending', // Contributors submit posts for approval
    submittedAt: new Date()
  }
  console.log('📝 Contributor Controller: Creating new post with data:', postData);
  const post = await Post.create(postData)
  console.log('📝 Contributor Controller: New post created with ID:', post._id);
  await post.populate('author', 'name email')
  await post.populate('categories', 'name slug')

  // Debug logging
  console.log('🔍 Debug - Post created with status:', post.status);
  console.log('🔍 Debug - User exists:', !!req.user);
  console.log('🔍 Debug - User details:', req.user ? { name: req.user.name, email: req.user.email } : 'No user');

  // Send notification to admin team since post is submitted for review (pending status)
  if (post.status === 'pending' && req.user) {
    console.log('📧 Contributor Controller: Sending contributor submission notification email');
    console.log('📧 Email details:', {
      postId: post._id,
      postTitle: post.title,
      contributorEmail: req.user.email,
      contributorName: req.user.name,
      submittedAt: post.submittedAt
    });
    try {
      await emailService.sendContributorSubmissionNotification(post, req.user);
      console.log('✅ Contributor Controller: Submission notification sent successfully');
    } catch (emailError) {
      console.error('❌ Contributor Controller: Failed to send submission notification:', emailError);
      // Don't fail the request if email fails
    }
  }

  res.status(201).json({
    success: true,
    message: 'Post submitted successfully and is pending approval',
    data: post
  })
})

// @desc    Update contributor's own post
// @route   PUT /api/contributor/posts/:id
// @access  Private/Contributor
export const updateContributorPost = handleAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id
  const { id } = req.params

  const post = await Post.findOne({ _id: id, author: userId })

  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found or you do not have permission to edit it'
    })
  }

  // Only allow editing if post is in draft or rejected status
  if (!['draft', 'rejected'].includes(post.status)) {
    return res.status(400).json({
      success: false,
      error: 'You can only edit posts that are in draft or rejected status'
    })
  }

  // Prepare update data
  const updateData = {
    ...req.body,
    status: post.status === 'rejected' ? 'pending' : req.body.status || post.status,
    submittedAt: post.status === 'rejected' ? new Date() : post.submittedAt
  }

  // Filter out empty content sections before updating the post
  if (updateData.contentSections) {
    updateData.contentSections = updateData.contentSections.filter((section: any) => {
      // Keep image-only sections (they don't require content)
      if (section.type === 'image-only') {
        return true
      }
      // For text and image-text sections, ensure content is not empty
      return section.content && section.content.trim() !== ''
    })
  }

  // Generate new slug if title is being updated
  if (req.body.title && req.body.title !== post.title) {
    const slug = generateSlug(req.body.title)

    // Ensure slug is unique by checking existing posts (excluding current post)
    let uniqueSlug = slug
    let counter = 1
    while (await Post.findOne({ slug: uniqueSlug, _id: { $ne: id } })) {
      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    updateData.slug = uniqueSlug
  }

  const updatedPost = await Post.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  }).populate('author', 'name email')
   .populate('categories', 'name slug')

  // Send notification to admin team if rejected post is being resubmitted for review
  if (post.status === 'rejected' && updateData.status === 'pending' && req.user) {
    console.log('📧 Contributor Controller: Sending resubmission notification email for updated post');
    console.log('📧 Email details:', {
      postId: updatedPost?._id,
      postTitle: updatedPost?.title,
      contributorEmail: req.user.email,
      contributorName: req.user.name,
      resubmittedAt: updateData.submittedAt
    });
    try {
      await emailService.sendContributorSubmissionNotification(updatedPost as any, req.user);
      console.log('✅ Contributor Controller: Resubmission notification sent successfully');
    } catch (emailError) {
      console.error('❌ Contributor Controller: Failed to send resubmission notification:', emailError);
      // Don't fail the request if email fails
    }
  }

  res.status(200).json({
    success: true,
    message: post.status === 'rejected' ? 'Post updated and resubmitted for approval' : 'Post updated successfully',
    data: updatedPost
  })
})

// @desc    Delete contributor's own post
// @route   DELETE /api/contributor/posts/:id
// @access  Private/Contributor
export const deleteContributorPost = handleAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id
  const { id } = req.params

  const post = await Post.findOne({ _id: id, author: userId })

  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found or you do not have permission to delete it'
    })
  }

  // Only allow deletion if post is not published
  if (post.status === 'published') {
    return res.status(400).json({
      success: false,
      error: 'Published posts cannot be deleted. Contact an admin to archive it.'
    })
  }

  await Post.findByIdAndDelete(id)

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully'
  })
})

// @desc    Get contributor dashboard stats
// @route   GET /api/contributor/dashboard
// @access  Private/Contributor
export const getContributorDashboard = handleAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id

  const [
    totalPosts,
    publishedPosts,
    pendingPosts,
    rejectedPosts,
    draftPosts,
    totalViews,
    totalLikes
  ] = await Promise.all([
    Post.countDocuments({ author: userId }),
    Post.countDocuments({ author: userId, status: 'published' }),
    Post.countDocuments({ author: userId, status: 'pending' }),
    Post.countDocuments({ author: userId, status: 'rejected' }),
    Post.countDocuments({ author: userId, status: 'draft' }),
    Post.aggregate([
      { $match: { author: userId, status: 'published' } },
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ]),
    Post.aggregate([
      { $match: { author: userId, status: 'published' } },
      { $group: { _id: null, totalLikes: { $sum: { $size: '$likes' } } } }
    ])
  ])

  // Get recent posts
  const recentPosts = await Post.find({ author: userId })
    .select('title status createdAt updatedAt publishedAt')
    .sort({ updatedAt: -1 })
    .limit(5)

  // Get recent rejections with notes
  const recentRejections = await Post.find({
    author: userId,
    status: 'rejected'
  })
    .select('title moderationNotes moderatedAt')
    .populate('moderatedBy', 'name')
    .sort({ moderatedAt: -1 })
    .limit(3)

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalPosts,
        publishedPosts,
        pendingPosts,
        rejectedPosts,
        draftPosts,
        totalViews: totalViews[0]?.totalViews || 0,
        totalLikes: totalLikes[0]?.totalLikes || 0
      },
      recentPosts,
      recentRejections
    }
  })
})

// @desc    Upload image for contributor post
// @route   POST /api/contributor/upload-image
// @access  Private/Contributor
export const uploadContributorImage = handleAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No image file provided'
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
    const fileName = `BagPackStories/posts/${timestamp}-${originalName}.jpg`

    // Upload to Cloudinary
    const result = await uploadBufferToCloudinary(processedImage, fileName, 'BagPackStories/posts')

    res.status(200).json({
      success: true,
      data: {
        url: result.url,
        publicId: result.public_id
      }
    })
  } catch (error: any) {
    console.error('Error uploading contributor image:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload image'
    })
  }
})
