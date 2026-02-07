'use client'

import { useState, useEffect, useRef } from 'react'
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
import { readerApi } from '@/lib/readerApi'

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
    website?: string
  }
  joinedDate: string
  stats: {
    posts: number
    followers: number
    following: number
  }
}

function ProfileForm({ profile, formData, setFormData, isEditing }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Full Name
        </label>
        {isEditing ? (
          <input
            id="name"
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
        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Address
        </span>
        <p className="text-gray-900 dark:text-white">{profile.email}</p>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Location
        </label>
        {isEditing ? (
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="location"
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
        <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Website
        </label>
        {isEditing ? (
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="website"
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
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Bio
        </label>
        {isEditing ? (
          <textarea
            id="bio"
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
        <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Social Links
        </h3>
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
  )
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    socialLinks: {
      twitter: '',
      instagram: '',
      facebook: '',
      website: ''
    }
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const loadProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const profileData: any = await readerApi.getProfile()
        console.log('Raw API response:', profileData)
        console.log('User data path:', profileData?.data?.user)
        
        // Backend returns data in profileData.data.user
        const userData = profileData.data?.user || profileData.user || profileData
        console.log('Final user data used:', userData)
        console.log('User name:', userData?.name)
        console.log('User email:', userData?.email)
        console.log('User avatar from API:', userData?.avatar)
        
        const userProfile: UserProfile = {
          name: userData.name || user?.name || 'Travel Blogger',
          email: userData.email || user?.email || 'traveler@example.com',
          bio: userData.bio || '',
          avatar: userData.avatar || user?.avatar || '',
          location: userData.location || '',
          website: userData.website || userData.socialLinks?.website || '',
          socialLinks: userData.socialLinks || {
            twitter: '',
            instagram: '',
            facebook: '',
            website: ''
          },
          joinedDate: userData.joinedDate || userData.createdAt || 'March 2023',
          stats: userData.stats || {
            posts: 0,
            followers: 0,
            following: 0
          }
        }
        
        console.log('Final user profile avatar:', userProfile.avatar)
        
        setProfile(userProfile)
        setFormData({
          name: userProfile.name,
          bio: userProfile.bio || '',
          location: userProfile.location || '',
          website: userProfile.socialLinks?.website || userProfile.website || '',
          socialLinks: {
            twitter: userProfile.socialLinks?.twitter || '',
            instagram: userProfile.socialLinks?.instagram || '',
            facebook: userProfile.socialLinks?.facebook || '',
            website: userProfile.socialLinks?.website || userProfile.website || ''
          }
        })
      } catch (error) {
        console.error('Error loading profile:', error)
        setError('Failed to load profile data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [isAuthenticated, router, user])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      setError(null)
      
      // Prepare data to match backend expectations
      const profileData = {
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        socialLinks: {
          ...formData.socialLinks,
          website: formData.website
        }
      }
      
      await readerApi.updateProfile(profileData)
      
      if (profile) {
        setProfile({
          ...profile,
          name: formData.name,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          socialLinks: {
            ...formData.socialLinks,
            website: formData.website
          }
        })
      }
      
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
      setError('Failed to save profile changes. Please try again.')
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
        website: profile.socialLinks?.website || '',
        socialLinks: {
          twitter: profile.socialLinks?.twitter || '',
          instagram: profile.socialLinks?.instagram || '',
          facebook: profile.socialLinks?.facebook || '',
          website: profile.socialLinks?.website || profile.website || ''
        }
      })
    }
    setIsEditing(false)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPEG, PNG, GIF, etc.)')
        return
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }

      setSelectedFile(file)
      setError(null)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async () => {
    if (!selectedFile) return

    setIsUploadingAvatar(true)
    try {
      setError(null)
      
      const response: any = await readerApi.uploadAvatar(selectedFile)
      console.log('Avatar upload response:', response)
      console.log('Avatar URL from response:', response.data?.avatar || response.avatar)
      
      if (profile) {
        setProfile({
          ...profile,
          avatar: response.data?.avatar || response.avatar
        })
        console.log('Updated profile avatar:', response.data?.avatar || response.avatar)
      }
      
      setSelectedFile(null)
      setPreviewUrl(null)
      setUploadSuccess(true)
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Hide success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setError('Failed to upload avatar. Please try again.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleCancelAvatar = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const renderAvatar = () => {
    if (previewUrl) {
      console.log('Using preview URL:', previewUrl)
      return <img src={previewUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover" />
    }
    if (profile?.avatar) {
      console.log('Using profile avatar URL:', profile.avatar)
      return <img src={profile.avatar} alt={profile.name} className="w-24 h-24 rounded-full object-cover" />
    }
    console.log('Using default User icon')
    return <User className="w-12 h-12 text-white" />
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 max-w-md mx-4">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error Loading Profile
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (uploadSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 max-w-md mx-4">
          <div className="text-center">
            <div className="text-green-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Avatar Updated Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your profile picture has been updated.
            </p>
            <button
              onClick={() => setUploadSuccess(false)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">Profile not found</h2>
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
              <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center overflow-hidden">
                {renderAvatar()}
              </div>
              
              {isEditing && (
                <div className="absolute -bottom-2 -right-2 flex space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-600 transition-colors"
                    title="Change avatar"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  
                  {selectedFile && (
                    <div className="flex space-x-1">
                      <button
                        onClick={handleAvatarUpload}
                        disabled={isUploadingAvatar}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-600 transition-colors disabled:opacity-50"
                        title="Upload avatar"
                      >
                        {isUploadingAvatar ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={handleCancelAvatar}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-600 transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {!isEditing && (
                <button className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-600">
                  <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              )}
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-1">
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
            <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-white">Profile Information</h2>
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

          <ProfileForm 
            profile={profile} 
            formData={formData} 
            setFormData={setFormData} 
            isEditing={isEditing} 
          />
        </motion.div>
      </div>
    </div>
  )
}
