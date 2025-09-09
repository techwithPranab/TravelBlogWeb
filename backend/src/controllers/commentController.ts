import { Request, Response } from 'express'
import Comment from '../models/Comment'
import { validationResult, body } from 'express-validator'

// Validation rules for comment submission
export const validateComment = [
  body('resourceType').isIn(['blog', 'destination', 'guide', 'photo']).withMessage('Invalid resource type'),
  body('resourceId').notEmpty().withMessage('Resource ID is required'),
  body('author.name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
  body('author.email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Content must be between 1-2000 characters'),
  body('parentId').optional().isMongoId().withMessage('Invalid parent comment ID')
]

// Get comments for a specific resource
export const getComments = async (req: Request, res: Response) => {
  try {
    const { resourceType, resourceId } = req.params
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeReplies = 'true',
      parentId
    } = req.query

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as string,
      includeReplies: includeReplies === 'true',
      parentId: parentId as string
    }

    const comments = await (Comment as any).getResourceComments(resourceType, resourceId, options)
    
    let totalComments
    if (parentId) {
      totalComments = await Comment.countDocuments({
        resourceType,
        resourceId,
        parentId,
        status: 'approved'
      })
    } else {
      // For top-level comments, check for null parentId
      totalComments = await Comment.countDocuments({
        resourceType,
        resourceId,
        parentId: null,
        status: 'approved'
      })
    }

    const stats = await (Comment as any).getCommentStats(resourceType, resourceId)

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: options.page,
          totalPages: Math.ceil(totalComments / options.limit),
          totalComments,
          hasNextPage: options.page < Math.ceil(totalComments / options.limit),
          hasPrevPage: options.page > 1
        },
        stats: stats[0] || {
          totalComments: 0,
          totalLikes: 0,
          totalDislikes: 0,
          topLevelComments: 0,
          replies: 0
        }
      }
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comments'
    })
  }
}

// Submit a new comment
export const submitComment = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const {
      resourceType,
      resourceId,
      author,
      content,
      parentId,
      attachments = []
    } = req.body

    // Validate parent comment if provided
    if (parentId) {
      const parentComment = await Comment.findById(parentId)
      if (!parentComment) {
        return res.status(400).json({
          success: false,
          error: 'Parent comment not found'
        })
      }
      
      if (parentComment.resourceType !== resourceType || parentComment.resourceId !== resourceId) {
        return res.status(400).json({
          success: false,
          error: 'Parent comment belongs to different resource'
        })
      }
    }

    const comment = new Comment({
      resourceType,
      resourceId,
      author: {
        name: author.name.trim(),
        email: author.email.toLowerCase().trim(),
        avatar: author.avatar,
        website: author.website
      },
      content: content.trim(),
      parentId,
      attachments,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })

    await comment.save()

    // If this is a reply, add it to parent's replies array
    if (parentId) {
      const parentComment = await Comment.findById(parentId)
      if (parentComment) {
        await parentComment.addReply(comment._id.toString())
      }
    }

    res.status(201).json({
      success: true,
      message: 'Comment submitted successfully',
      data: {
        commentId: comment._id,
        comment
      }
    })
  } catch (error) {
    console.error('Error submitting comment:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to submit comment'
    })
  }
}

// Get a specific comment by ID
export const getComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      })
    }

    // Only return approved comments unless it's an admin request
    if (comment.status !== 'approved') {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      })
    }

    res.json({
      success: true,
      data: comment
    })
  } catch (error) {
    console.error('Error fetching comment:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comment'
    })
  }
}

// Like a comment
export const likeComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      })
    }

    if (comment.status !== 'approved') {
      return res.status(400).json({
        success: false,
        error: 'Cannot like unapproved comment'
      })
    }

    await comment.like()

    res.json({
      success: true,
      message: 'Comment liked successfully',
      data: {
        likes: comment.likes,
        score: comment.likes - comment.dislikes
      }
    })
  } catch (error) {
    console.error('Error liking comment:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to like comment'
    })
  }
}

// Dislike a comment
export const dislikeComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      })
    }

    if (comment.status !== 'approved') {
      return res.status(400).json({
        success: false,
        error: 'Cannot dislike unapproved comment'
      })
    }

    await comment.dislike()

    res.json({
      success: true,
      message: 'Comment disliked successfully',
      data: {
        dislikes: comment.dislikes,
        score: comment.likes - comment.dislikes
      }
    })
  } catch (error) {
    console.error('Error disliking comment:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to dislike comment'
    })
  }
}

// Edit a comment
export const editComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params
    const { content, reason, authorEmail } = req.body

    if (!content || content.trim().length < 1 || content.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Content must be between 1-2000 characters'
      })
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      })
    }

    // Verify the user is the author
    if (comment.author.email !== authorEmail) {
      return res.status(403).json({
        success: false,
        error: 'You can only edit your own comments'
      })
    }

    await comment.edit(content.trim(), reason)

    res.json({
      success: true,
      message: 'Comment edited successfully',
      data: {
        comment
      }
    })
  } catch (error) {
    console.error('Error editing comment:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to edit comment'
    })
  }
}

// Flag a comment
export const flagComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params
    const { reason, reportedBy, description } = req.body

    const validReasons = ['spam', 'inappropriate', 'harassment', 'off-topic', 'other']
    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid flag reason'
      })
    }

    if (!reportedBy) {
      return res.status(400).json({
        success: false,
        error: 'Reporter identification is required'
      })
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      })
    }

    await comment.flag(reason, reportedBy, description)

    res.json({
      success: true,
      message: 'Comment flagged successfully',
      data: {
        flagged: comment.flagged,
        status: comment.status
      }
    })
  } catch (error) {
    console.error('Error flagging comment:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to flag comment'
    })
  }
}

// Admin routes for comment moderation
export const moderateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params
    const { status, moderationNotes } = req.body

    if (!['pending', 'approved', 'rejected', 'hidden'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be pending, approved, rejected, or hidden'
      })
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      })
    }

    comment.status = status
    if (moderationNotes) comment.moderationNotes = moderationNotes

    await comment.save()

    res.json({
      success: true,
      message: 'Comment moderated successfully',
      data: {
        commentId: comment._id,
        status: comment.status
      }
    })
  } catch (error) {
    console.error('Error moderating comment:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to moderate comment'
    })
  }
}

// Get flagged comments for moderation
export const getFlaggedComments = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as string
    }

    const comments = await (Comment as any).getFlaggedComments(options)
    const totalComments = await Comment.countDocuments({ flagged: true })

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: options.page,
          totalPages: Math.ceil(totalComments / options.limit),
          totalComments,
          hasNextPage: options.page < Math.ceil(totalComments / options.limit),
          hasPrevPage: options.page > 1
        }
      }
    })
  } catch (error) {
    console.error('Error fetching flagged comments:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flagged comments'
    })
  }
}

// Delete a comment (admin only)
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      })
    }

    // Remove from parent's replies if it's a reply
    if (comment.parentId) {
      const parentComment = await Comment.findById(comment.parentId)
      if (parentComment) {
        await parentComment.removeReply(commentId)
      }
    }

    // Delete all replies to this comment
    await Comment.deleteMany({ parentId: commentId })

    // Delete the comment itself
    await Comment.findByIdAndDelete(commentId)

    res.json({
      success: true,
      message: 'Comment and its replies deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting comment:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete comment'
    })
  }
}

// Get comment statistics for a resource
export const getCommentStats = async (req: Request, res: Response) => {
  try {
    const { resourceType, resourceId } = req.params

    const stats = await (Comment as any).getCommentStats(resourceType, resourceId)

    res.json({
      success: true,
      data: stats[0] || {
        totalComments: 0,
        totalLikes: 0,
        totalDislikes: 0,
        topLevelComments: 0,
        replies: 0
      }
    })
  } catch (error) {
    console.error('Error fetching comment stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comment statistics'
    })
  }
}
