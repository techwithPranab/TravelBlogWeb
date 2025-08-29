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
}

export default function BlogDetailsPage() {
  const params = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPost({
        id: '1',
        title: 'The Hidden Gems of Santorini: Beyond the Famous Blue Domes',
        content: `
          <p>Santorini, with its iconic blue-domed churches and stunning sunsets, is undoubtedly one of Greece's most photographed destinations. But beyond the Instagram-famous spots lies a treasure trove of hidden gems waiting to be discovered.</p>
          
          <h2>The Secret Beaches</h2>
          <p>While most tourists flock to Kamari and Perissa, the real magic happens at the lesser-known beaches. Red Beach, with its dramatic red cliffs, offers a more secluded experience, especially if you arrive early in the morning.</p>
          
          <h2>Traditional Villages</h2>
          <p>Venture beyond Oia and Fira to discover authentic Greek culture in villages like Megalochori and Emporio. These settlements offer a glimpse into traditional Santorinian life, complete with local tavernas serving family recipes passed down through generations.</p>
          
          <h2>Wine Tasting Adventures</h2>
          <p>Santorini's volcanic soil produces some of Greece's most unique wines. Visit local wineries like Santo Wines or Venetsanos for tastings with spectacular views of the caldera.</p>
          
          <h2>Planning Your Visit</h2>
          <p>The best time to explore these hidden gems is during the shoulder seasons (April-May and September-October) when the crowds are thinner and the weather is still perfect for exploration.</p>
        `,
        excerpt: 'Discover the secret spots and hidden treasures of Santorini that most tourists never see.',
        featuredImage: {
          url: '/images/santorini-hidden-gems.jpg',
          alt: 'Hidden beach in Santorini',
          caption: 'A secluded beach away from the crowds'
        },
        author: {
          name: 'Sarah Thompson',
          avatar: '/images/author-sarah.jpg',
          bio: 'Travel writer and photographer with 10+ years exploring the Mediterranean'
        },
        category: {
          name: 'Destinations',
          slug: 'destinations'
        },
        tags: ['Greece', 'Santorini', 'Hidden Gems', 'Travel Tips'],
        publishedAt: '2024-01-15',
        readTime: 8,
        views: 2341,
        likes: 156,
        isLiked: false,
        isBookmarked: false,
        destination: {
          country: 'Greece',
          city: 'Santorini'
        }
      })

      setComments([
        {
          id: '1',
          content: 'Amazing article! I visited Santorini last year but missed these hidden spots. Definitely going back with this guide.',
          author: {
            name: 'Alex Chen',
            avatar: '/images/user-alex.jpg'
          },
          createdAt: '2024-01-16',
          likes: 12,
          isLiked: false,
          replies: [
            {
              id: '2',
              content: 'Same here! The traditional villages sound fascinating.',
              author: {
                name: 'Maria Rodriguez',
                avatar: '/images/user-maria.jpg'
              },
              createdAt: '2024-01-16',
              likes: 5,
              isLiked: true
            }
          ]
        }
      ])

      setIsLoading(false)
    }, 1000)
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
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmittingComment(true)
    
    // Simulate API call
    setTimeout(() => {
      const comment: Comment = {
        id: Date.now().toString(),
        content: newComment,
        author: {
          name: 'You',
          avatar: '/images/default-avatar.jpg'
        },
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false
      }
      
      setComments([comment, ...comments])
      setNewComment('')
      setIsSubmittingComment(false)
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
          <Link href="/blog" className="text-blue-600 hover:text-blue-800">
            ← Back to Blog
          </Link>
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
            <Link href={`/blog/category/${post.category.slug}`} className="text-blue-600 hover:text-blue-800">
              {post.category.name}
            </Link>
            {post.destination && (
              <>
                <span>•</span>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {post.destination.city ? `${post.destination.city}, ` : ''}{post.destination.country}
                </div>
              </>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {post.excerpt}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={post.author.avatar} 
                alt={post.author.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="font-medium text-gray-900">{post.author.name}</div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {post.readTime} min read
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {post.views.toLocaleString()} views
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  post.isLiked 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                <span>{post.likes}</span>
              </button>
              
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg transition-colors ${
                  post.isBookmarked 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
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
            src={post.featuredImage.url}
            alt={post.featuredImage.alt}
            fill
            className="object-cover"
          />
          {post.featuredImage.caption && (
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
              {post.featuredImage.caption}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none mb-12">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
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
                src={post.author.avatar} 
                alt={post.author.name}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">About {post.author.name}</h3>
                <p className="text-gray-600">{post.author.bio}</p>
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
