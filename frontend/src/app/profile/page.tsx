'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Camera, 
  Edit,
  Save,
  X,
  Globe,
  Twitter,
  Instagram,
  Facebook
} from 'lucide-react'
import { motion } from 'framer-motion'

interface UserProfile {
  name: string
  email: string
  bio?: string
  avatar?: string
  location?: string
  website?: string
  socialLinks?: {
    twitter?: string
    instagram?: string
    facebook?: string
  }
  joinedDate: string
  stats: {
    posts: number
    followers: number
    following: number
  }
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    socialLinks: {
      twitter: '',
      instagram: '',
      facebook: ''
    }
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Load user profile data
    const loadProfile = async () => {
      try {
        // In a real app, you would fetch this from your API
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
        
        const mockProfile: UserProfile = {
          name: user?.name || 'Travel Blogger',
          email: user?.email || 'traveler@example.com',
          bio: 'Passionate traveler exploring the world one destination at a time. Sharing stories, tips, and photos from my adventures around the globe.',
          avatar: user?.avatar || '',
          location: 'San Francisco, CA',
          website: 'https://mytravelblog.com',
          socialLinks: {
            twitter: 'https://twitter.com/travelblogger',
            instagram: 'https://instagram.com/travelblogger',
            facebook: 'https://facebook.com/travelblogger'
          },
          joinedDate: 'March 2023',
          stats: {
            posts: 25,
            followers: 1205,
            following: 189
          }
        }
        
        setProfile(mockProfile)
        setFormData({
          name: mockProfile.name,
          bio: mockProfile.bio || '',
          location: mockProfile.location || '',
          website: mockProfile.website || '',
          socialLinks: {
            twitter: mockProfile.socialLinks?.twitter || '',
            instagram: mockProfile.socialLinks?.instagram || '',
            facebook: mockProfile.socialLinks?.facebook || ''
          }
        })
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [isAuthenticated, router, user])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // In a real app, you would send this to your API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      if (profile) {
        setProfile({
          ...profile,
          name: formData.name,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          socialLinks: formData.socialLinks
        })
      }
      
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        socialLinks: {
          twitter: profile.socialLinks?.twitter || '',
          instagram: profile.socialLinks?.instagram || '',
          facebook: profile.socialLinks?.facebook || ''
        }
      })
    }
    setIsEditing(false)
  }

  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile not found</h2>
          <p className="text-gray-600 dark:text-gray-400">Unable to load profile information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-600">
                <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {profile.name}
                  </h1>
                  <div className="flex items-center justify-center sm:justify-start space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{profile.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {profile.joinedDate}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                </button>
              </div>

              {/* Stats */}
              <div className="flex justify-center sm:justify-start space-x-8 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{profile.stats.posts}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{profile.stats.followers}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{profile.stats.following}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
            {isEditing && (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{profile.name}</p>
              )}
            </div>

            {/* Email (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <p className="text-gray-900 dark:text-white">{profile.email}</p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              {isEditing ? (
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your location"
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{profile.location || 'Not specified'}</span>
                </div>
              )}
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              {isEditing ? (
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="https://your-website.com"
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  {profile.website ? (
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                      {profile.website}
                    </a>
                  ) : (
                    <span className="text-gray-900 dark:text-white">Not specified</span>
                  )}
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Tell us about yourself and your travel experiences..."
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{profile.bio || 'No bio provided'}</p>
              )}
            </div>

            {/* Social Links */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Social Links
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Twitter */}
                <div>
                  {isEditing ? (
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={formData.socialLinks.twitter}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                        })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Twitter URL"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Twitter className="w-4 h-4 text-blue-400" />
                      {profile.socialLinks?.twitter ? (
                        <a 
                          href={profile.socialLinks.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-500"
                        >
                          Twitter
                        </a>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Not connected</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Instagram */}
                <div>
                  {isEditing ? (
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={formData.socialLinks.instagram}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                        })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Instagram URL"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Instagram className="w-4 h-4 text-pink-400" />
                      {profile.socialLinks?.instagram ? (
                        <a 
                          href={profile.socialLinks.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-pink-400 hover:text-pink-500"
                        >
                          Instagram
                        </a>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Not connected</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Facebook */}
                <div>
                  {isEditing ? (
                    <div className="relative">
                      <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={formData.socialLinks.facebook}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                        })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Facebook URL"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Facebook className="w-4 h-4 text-blue-600" />
                      {profile.socialLinks?.facebook ? (
                        <a 
                          href={profile.socialLinks.facebook} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Facebook
                        </a>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Not connected</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
