'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Calendar, 
  Clock, 
  Heart, 
  Share2, 
  Bookmark, 
  Tag, 
  MapPin,
  ArrowLeft,
  MessageCircle,
  Eye,
  ThumbsUp,
  Youtube
} from 'lucide-react'
import ContentSection from '@/components/blog/ContentSection'
import YouTubeVideo from '@/components/blog/YouTubeVideo'
import CommentSection from '@/components/blog/CommentSection'
import { postsApi } from '@/lib/api'
import { containsProfanity, getProfanityError } from '@/utils/profanityFilter'

interface BlogPost {
  id: string
  title: string
  content: string
  contentSections?: Array<{
    id: string
    type: 'text' | 'image-text' | 'image-only'
    title?: string
    content: string
    image?: {
      url: string
      alt: string
      caption?: string
    }
    imagePosition?: 'left' | 'right' | 'center' | 'full-width'
    order: number
  }>
  youtubeVideos?: Array<{
    id: string
    title: string
    url: string
    description?: string
    order: number
  }>
  excerpt: string
  featuredImage: {
    url: string
    alt: string
    caption?: string
  }
  images: string[]
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
  const { user, isAuthenticated } = useAuth()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [commentError, setCommentError] = useState<string | null>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number>(0)

  // Simulated API functions
  const fetchBlogPost = async (slug: string): Promise<BlogApiResponse> => {
    try {
      const response = await postsApi.getBySlug(slug)
      
      // Transform the backend data to match our frontend interface
      const post = response.data
      const transformedPost: BlogPost = {
        id: post._id,
        title: post.title,
        content: post.content,
        contentSections: post.contentSections?.sort((a: any, b: any) => a.order - b.order) || [],
        youtubeVideos: post.youtubeVideos?.sort((a: any, b: any) => a.order - b.order) || [],
        excerpt: post.excerpt,
        featuredImage: {
          url: (typeof post.featuredImage === 'object' && post.featuredImage?.url) || (typeof post.featuredImage === 'string' ? post.featuredImage : ''),
          alt: (typeof post.featuredImage === 'object' && post.featuredImage?.alt) || 'Blog post image',
          caption: (typeof post.featuredImage === 'object' && post.featuredImage?.caption) || undefined
        },
        images: post.images || [],
        author: {
          name: post.author?.name || 'Unknown Author',
          avatar: post.author?.avatar || '/images/default-avatar.jpg',
          bio: 'Travel enthusiast and writer'
        },
        category: {
          name: post.categories?.[0]?.name || 'Uncategorized',
          slug: post.categories?.[0]?.slug || 'uncategorized'
        },
        tags: post.tags || [],
        publishedAt: post.publishedAt || post.createdAt,
        readTime: post.readTime || 5,
        views: post.views || post.viewCount || 0,
        likes: post.likeCount || 0,
        isLiked: false, // This would need authentication to determine
        isBookmarked: false, // This would need authentication to determine
        destination: post.destination && post.destination.country ? {
          country: post.destination.country,
          city: post.destination.city
        } : undefined
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/blog/${postId}`)
      
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
      // Check for profanity before submitting
      if (containsProfanity(content)) {
        throw new Error(getProfanityError())
      }

      // Get user info from auth context
      const authorName = isAuthenticated && user ? user.name : 'Anonymous User'
      const authorEmail = isAuthenticated && user ? user.email : 'anonymous@example.com'
      const authorAvatar = isAuthenticated && user?.avatar ? user.avatar : '/images/default-avatar.jpg'

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isAuthenticated ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
        },
        body: JSON.stringify({
          resourceType: 'blog',
          resourceId: postId,
          author: {
            name: authorName,
            email: authorEmail,
            avatar: authorAvatar
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
          name: authorName,
          avatar: authorAvatar
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

  const handleCommentSubmit = async (content: string) => {
    if (!post?.id) {
      throw new Error('Unable to post comment. Please try again.')
    }

    const response = await submitComment(post.id, content)
    
    if (response.success) {
      setComments([response.data, ...comments])
    } else {
      throw new Error(response.message || 'Failed to post comment')
    }
  }

  const handleImageClick = (imageUrl: string, index: number) => {
    setLightboxImage(imageUrl)
    setLightboxIndex(index)
  }

  const closeLightbox = () => {
    setLightboxImage(null)
    setLightboxIndex(0)
  }

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!post) return

    const sectionImages = post.contentSections?.filter(s => s.image).map(s => s.image!.url) || []
    const allImages = [post.featuredImage.url, ...post.images, ...sectionImages]
    let newIndex = lightboxIndex

    if (direction === 'prev') {
      newIndex = lightboxIndex > 0 ? lightboxIndex - 1 : allImages.length - 1
    } else {
      newIndex = lightboxIndex < allImages.length - 1 ? lightboxIndex + 1 : 0
    }

    setLightboxImage(allImages[newIndex])
    setLightboxIndex(newIndex)
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
            <Link href={`/blog/category/${post?.category?.slug || 'uncategorized'}`} className="text-blue-600 hover:text-blue-800">
              {post?.category?.name || 'Uncategorized'}
            </Link>
            {post?.destination && (
              <>
                <span>•</span>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {post?.destination?.city ? `${post.destination.city}, ` : ''}{post?.destination?.country}
                </div>
              </>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post?.title || ''}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {post?.excerpt || ''}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={post?.author?.avatar || '/images/default-avatar.jpg'} 
                alt={post?.author?.name || 'Unknown Author'}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="font-medium text-gray-900">{post?.author?.name || 'Unknown Author'}</div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(post?.publishedAt || new Date().toISOString()).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {post?.readTime || 0} min read
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {(post?.views || 0).toLocaleString()} views
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  (post?.isLiked ?? false) 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${post?.isLiked ? 'fill-current' : ''}`} />
                <span>{post?.likes ?? 0}</span>
              </button>
              
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg transition-colors ${
                  (post?.isBookmarked ?? false) 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${post?.isBookmarked ? 'fill-current' : ''}`} />
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
        <div className="relative h-96 md:h-[600px] rounded-2xl overflow-hidden group cursor-pointer">
            <Image
            src={post?.featuredImage?.url || '/images/default-image.jpg'}
            alt={post?.featuredImage?.alt || 'Featured image'}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {post?.featuredImage?.caption && (
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
              {post.featuredImage.caption}
            </div>
          )}
          {/* Click overlay */}
          <button
            onClick={() => post?.featuredImage?.url && handleImageClick(post.featuredImage.url, 0)}
            className="absolute inset-0 w-full h-full bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-2xl"
            aria-label="View featured image in full size"
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Additional Images Gallery */}
  {post?.images && post.images.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {post.images.map((imageUrl, index) => (
                <button
                  key={`${imageUrl}-${index}`}
                  className="relative group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                  onClick={() => handleImageClick(imageUrl, index + 1)} // +1 because featured image is index 0
                  aria-label={`View gallery image ${index + 1} in full size`}
                >
                  <div className="aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={`Gallery image ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Content Sections */}
          {post?.contentSections && post.contentSections.length > 0 ? (
            <div className="mb-12">
              {post?.contentSections?.map((section) => (
                <ContentSection
                  key={section.id}
                  section={section}
                  onImageClick={(imageUrl) => {
                    // Find the index of this image in all images
                    const allImages = [post?.featuredImage?.url || '', ...(post?.images || []), ...(post?.contentSections?.filter(s => s.image).map(s => s.image!.url) || [])]
                    const index = allImages.findIndex(img => img === imageUrl)
                    handleImageClick(imageUrl, index >= 0 ? index : 0)
                  }}
                />
              ))}
            </div>
          ) : (
            /* Fallback to traditional content */
            <div className="prose prose-lg max-w-none mb-12">
              <div dangerouslySetInnerHTML={{ __html: post?.content || '' }} />
            </div>
          )}

          {/* YouTube Videos Section */}
          {post?.youtubeVideos && post.youtubeVideos.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Youtube className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-bold text-gray-900">Related Videos</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {post.youtubeVideos
                  .sort((a, b) => a.order - b.order)
                  .map((video) => (
                    <YouTubeVideo key={video.id} video={video} />
                  ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {post?.tags?.map((tag) => (
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
                src={post?.author?.avatar || '/images/default-avatar.jpg'} 
                alt={post?.author?.name || 'Unknown Author'}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">About {post?.author?.name || 'Unknown Author'}</h3>
                <p className="text-gray-600">{post?.author?.bio || 'Travel enthusiast and writer'}</p>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <CommentSection
            resourceId={post?.id || ''}
            resourceType="blog"
            comments={comments}
            onCommentSubmit={handleCommentSubmit}
          />
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-5xl max-h-full">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              aria-label="Close lightbox"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation buttons */}
            {post && (post.images.length > 0 || (post.contentSections && post.contentSections.some(s => s.image))) && (
              <>
                <button
                  onClick={() => navigateLightbox('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigateLightbox('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image */}
            <div className="relative">
              <Image
                src={lightboxImage}
                alt="Gallery image"
                width={1200}
                height={800}
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>

            {/* Image counter */}
            {post && (post.images.length > 0 || (post.contentSections && post.contentSections.some(s => s.image))) && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {lightboxIndex + 1} / {[post.featuredImage.url, ...post.images, ...(post.contentSections?.filter(s => s.image).map(s => s.image!.url) || [])].length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
