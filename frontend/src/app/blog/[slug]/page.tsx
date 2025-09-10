'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Calendar, 
  Clock, 
  User, 
  Heart, 
  Share2, 
  Bookmark, 
  Tag, 
  MapPin,
  ArrowLeft,
  MessageCircle,
  Eye,
  ThumbsUp
} from 'lucide-react'
import { motion } from 'framer-motion'

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  featuredImage: {
    url: string
    alt: string
    caption?: string
  }
  author: {
    name: string
    avatar: string
    bio: string
  }
  category: {
    name: string
    slug: string
  }
  tags: string[]
  publishedAt: string
  readTime: number
  views: number
  likes: number
  isLiked: boolean
  isBookmarked: boolean
  destination?: {
    country: string
    city?: string
  }
}

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
  isSubmitting?: boolean
}

interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

interface BlogApiResponse extends ApiResponse<BlogPost> {}
interface CommentsApiResponse extends ApiResponse<Comment[]> {}
interface CommentSubmitResponse extends ApiResponse<Comment> {}

export default function BlogDetailsPage() {
  const params = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [commentError, setCommentError] = useState<string | null>(null)

  // Simulated API functions
  const fetchBlogPost = async (slug: string): Promise<BlogApiResponse> => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${slug}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch blog post')
      }

      // Transform the backend data to match our frontend interface
      const post = data.data
      const transformedPost: BlogPost = {
        id: post._id || post.id,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        featuredImage: {
          url: post.featuredImage?.url || post.featuredImage,
          alt: post.featuredImage?.alt || 'Blog post image',
          caption: post.featuredImage?.caption
        },
        author: {
          name: post.author?.name || 'Unknown Author',
          avatar: post.author?.avatar || '/images/default-avatar.jpg',
          bio: post.author?.bio || 'Travel enthusiast and writer'
        },
        category: {
          name: post.categories?.[0]?.name || 'Uncategorized',
          slug: post.categories?.[0]?.slug || 'uncategorized'
        },
        tags: post.tags || [],
        publishedAt: post.publishedAt || post.createdAt,
        readTime: post.readTime || 5,
        views: post.viewCount || 0,
        likes: post.likeCount || 0,
        isLiked: false, // This would need authentication to determine
        isBookmarked: false, // This would need authentication to determine
        destination: post.destination
      }

      return {
        data: transformedPost,
        success: true,
        message: 'Blog post fetched successfully'
      }
    } catch (error) {
      console.error('Error fetching blog post:', error)
      throw error
    }
  }

  const fetchComments = async (postId: string): Promise<CommentsApiResponse> => {
    try {
      const response = await fetch(`http://localhost:5000/api/comments/blog/${postId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch comments')
      }

      // Transform the backend comments to match our frontend interface
      const transformedComments: Comment[] = (data.data?.comments || []).map((comment: any) => ({
        id: comment._id || comment.id,
        content: comment.content,
        author: {
          name: comment.author?.name || 'Anonymous',
          avatar: comment.author?.avatar || '/images/default-avatar.jpg'
        },
        createdAt: comment.createdAt,
        likes: comment.likes || 0,
        isLiked: false, // This would need authentication to determine
        replies: comment.replies?.map((reply: any) => ({
          id: reply._id || reply.id,
          content: reply.content,
          author: {
            name: reply.author?.name || 'Anonymous',
            avatar: reply.author?.avatar || '/images/default-avatar.jpg'
          },
          createdAt: reply.createdAt,
          likes: reply.likes || 0,
          isLiked: false
        })) || []
      }))

      return {
        data: transformedComments,
        success: true,
        message: 'Comments fetched successfully'
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      // Return empty array instead of throwing error for comments
      return {
        data: [],
        success: true,
        message: 'Comments fetched successfully'
      }
    }
  }

  const submitComment = async (postId: string, content: string): Promise<CommentSubmitResponse> => {
    try {
      const response = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceType: 'blog',
          resourceId: postId,
          author: {
            name: 'Anonymous User', // In a real app, this would come from user authentication
            email: 'user@example.com', // In a real app, this would come from user authentication
            avatar: '/images/default-avatar.jpg'
          },
          content: content.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to submit comment')
      }

      // Transform the backend response to match our frontend interface
      const newComment: Comment = {
        id: data.data?.comment?._id || data.data?.commentId || Date.now().toString(),
        content: content.trim(),
        author: {
          name: 'Anonymous User',
          avatar: '/images/default-avatar.jpg'
        },
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false
      }

      return {
        data: newComment,
        success: true,
        message: 'Comment submitted successfully'
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      throw error
    }
  }

  useEffect(() => {
    const loadBlogData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const slug = params.slug as string

        // Fetch blog post and comments in parallel
        const [blogResponse, commentsResponse] = await Promise.allSettled([
          fetchBlogPost(slug),
          fetchComments('temp-id') // We'll update this after we get the post ID
        ])

        // Handle blog post response
        if (blogResponse.status === 'fulfilled') {
          setPost(blogResponse.value.data)
          
          // Now fetch comments with the correct post ID
          if (blogResponse.value.data.id) {
            const commentsResp = await fetchComments(blogResponse.value.data.id)
            if (commentsResp.success) {
              setComments(commentsResp.data)
            }
          }
        } else {
          console.error('Failed to fetch blog post:', blogResponse.reason)
          setError('Failed to load blog post. Please try again.')
        }

        // Handle comments response (this will be empty for now since we refetch with correct ID)
        if (commentsResponse.status === 'fulfilled') {
          // Comments are now fetched with the correct post ID above
        } else {
          console.error('Failed to fetch comments:', commentsResponse.reason)
          // Don't set error for comments failure, just log it
        }

      } catch (err) {
        console.error('Unexpected error:', err)
        setError('An unexpected error occurred. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.slug) {
      loadBlogData()
    }
  }, [params.slug])

  const handleLike = () => {
    if (post) {
      setPost({
        ...post,
        isLiked: !post.isLiked,
        likes: post.isLiked ? post.likes - 1 : post.likes + 1
      })
    }
  }

  const handleBookmark = () => {
    if (post) {
      setPost({
        ...post,
        isBookmarked: !post.isBookmarked
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        })
      } catch {
        // User cancelled share or share failed, fallback to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href)
          alert('Link copied to clipboard!')
        } catch {
          alert('Unable to share. Please copy the URL manually.')
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      } catch {
        alert('Unable to share. Please copy the URL manually.')
      }
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim()) {
      setCommentError('Please enter a comment')
      return
    }

    if (newComment.trim().length < 10) {
      setCommentError('Comment must be at least 10 characters long')
      return
    }

    if (newComment.length > 1000) {
      setCommentError('Comment must be less than 1000 characters')
      return
    }

    setIsSubmittingComment(true)
    setCommentError(null)

    try {
      const response = await submitComment(post!.id, newComment.trim())
      
      if (response.success) {
        setComments([response.data, ...comments])
        setNewComment('')
        // Show success message
        alert('Comment posted successfully!')
      } else {
        setCommentError(response.message || 'Failed to post comment')
      }
    } catch (err) {
      console.error('Comment submission error:', err)
      setCommentError(err instanceof Error ? err.message : 'Failed to post comment. Please try again.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog post...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/blog"
              className="block w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Link 
            href="/blog" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href={`/blog/category/${post!.category.slug}`} className="text-blue-600 hover:text-blue-800">
              {post!.category.name}
            </Link>
            {post!.destination && (
              <>
                <span>•</span>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {post!.destination.city ? `${post!.destination.city}, ` : ''}{post!.destination.country}
                </div>
              </>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post!.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {post!.excerpt}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={post!.author.avatar} 
                alt={post!.author.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="font-medium text-gray-900">{post!.author.name}</div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(post!.publishedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {post!.readTime} min read
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {(post!.views || 0).toLocaleString()} views
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  post!.isLiked 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${post!.isLiked ? 'fill-current' : ''}`} />
                <span>{post!.likes}</span>
              </button>
              
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg transition-colors ${
                  post!.isBookmarked 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${post!.isBookmarked ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="container mx-auto px-4 py-8">
        <div className="relative h-96 md:h-[600px] rounded-2xl overflow-hidden">
          <Image
            src={post!.featuredImage.url}
            alt={post!.featuredImage.alt}
            fill
            className="object-cover"
          />
          {post!.featuredImage.caption && (
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
              {post!.featuredImage.caption}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none mb-12">
            <div dangerouslySetInnerHTML={{ __html: post!.content }} />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {post!.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>

          {/* Author Bio */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-12">
            <div className="flex items-start space-x-4">
              <img 
                src={post!.author.avatar} 
                alt={post!.author.name}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">About {post!.author.name}</h3>
                <p className="text-gray-600">{post!.author.bio}</p>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-200 pt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <MessageCircle className="w-6 h-6 mr-2" />
              Comments ({comments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={comment.author.avatar} 
                      alt={comment.author.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">{comment.author.name}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{comment.content}</p>
                      <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{comment.likes}</span>
                      </button>
                    </div>
                  </div>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-14 mt-4 space-y-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <img 
                              src={reply.author.avatar} 
                              alt={reply.author.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-900 text-sm">{reply.author.name}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(reply.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm mb-2">{reply.content}</p>
                              <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-600">
                                <ThumbsUp className="w-3 h-3" />
                                <span>{reply.likes}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
