'use client'

import { useState } from 'react'
import { MessageCircle, ThumbsUp, Reply, User, Calendar } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { containsProfanity, getProfanityError } from '@/utils/profanityFilter'

interface Comment {
  id: string
  content: string
  author: {
    name: string
    avatar: string
  }
  createdAt: string
  likes: number
  isLiked: boolean
  replies?: Comment[]
}

interface CommentSectionProps {
  resourceId: string
  resourceType: string
  comments: Comment[]
  onCommentSubmit: (content: string) => Promise<void>
}

export default function CommentSection({ resourceId, resourceType, comments, onCommentSubmit }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim()) {
      setError('Please enter a comment')
      return
    }

    // Check for profanity
    if (containsProfanity(newComment)) {
      setError(getProfanityError())
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onCommentSubmit(newComment.trim())
      setNewComment('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-6 h-6 text-indigo-600" />
        <h3 className="text-2xl font-bold text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {isAuthenticated && user ? (
              <img
                src={user.avatar || '/images/default-avatar.jpg'}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                {isAuthenticated && user ? `Commenting as ${user.name}` : 'Comment as Anonymous User'}
              </label>
              <textarea
                id="comment"
                rows={4}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {isAuthenticated ? (
                  <>Signed in and ready to comment</>
                ) : (
                  <>
                    Commenting as guest. 
                    <button type="button" className="text-indigo-600 hover:underline ml-1">
                      Sign in for a better experience
                    </button>
                  </>
                )}
              </p>
              
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No comments yet</p>
            <p className="text-sm">Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <img
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">{comment.author.name}</h4>
                    <span className="text-gray-500 text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{comment.content}</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <button className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      Like ({comment.likes})
                    </button>
                    <button className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition-colors">
                      <Reply className="w-4 h-4" />
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
