'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Globe, Mail, Palette, Settings as SettingsIcon, Phone, MapPin, Clock } from 'lucide-react'
import { adminApi } from '@/lib/adminApi'

interface SiteSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  contactEmail: string
  supportEmail: string
  contactPhone?: string
  contactAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  businessHours?: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
  }
  supportSettings?: {
    email: string
    responseTime: string
  }
  socialLinks: {
    facebook?: string
    twitter?: string
    instagram?: string
    youtube?: string
    linkedin?: string
  }
  seoSettings: {
    metaTitle: string
    metaDescription: string
    metaKeywords: string[]
  }
  emailSettings: {
    fromEmail: string
    fromName: string
  }
  generalSettings: {
    postsPerPage: number
    commentsEnabled: boolean
    registrationEnabled: boolean
    maintenanceMode: boolean
  }
  theme: {
    primaryColor: string
    secondaryColor: string
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const response = await adminApi.getSettings() as any
        
        if (response.success) {
          // Ensure all nested objects exist with defaults
          const settingsData = response.data
          const completeSettings = {
            ...settingsData,
            contactPhone: settingsData.contactPhone || '+1 (555) 123-4567',
            contactAddress: {
              street: '123 Travel Street',
              city: 'San Francisco',
              state: 'CA',
              zipCode: '94105',
              country: 'USA',
              ...settingsData.contactAddress
            },
            businessHours: {
              monday: '9:00 AM - 6:00 PM',
              tuesday: '9:00 AM - 6:00 PM',
              wednesday: '9:00 AM - 6:00 PM',
              thursday: '9:00 AM - 6:00 PM',
              friday: '9:00 AM - 6:00 PM',
              saturday: '10:00 AM - 4:00 PM',
              sunday: 'Closed',
              ...settingsData.businessHours
            },
            supportSettings: {
              email: 'support@bagpackstories.in',
              responseTime: 'Within 24 hours',
              ...settingsData.supportSettings
            },
            socialLinks: {
              facebook: '',
              twitter: '',
              instagram: '',
              youtube: '',
              linkedin: '',
              ...settingsData.socialLinks
            },
            seoSettings: {
              metaTitle: 'BagPackStories - Discover Amazing Destinations',
              metaDescription: 'Discover amazing travel destinations, guides, and tips from experienced travelers around the world.',
              metaKeywords: [],
              ...settingsData.seoSettings
            },
            emailSettings: {
              fromEmail: 'noreply@example.com',
              fromName: 'BagPackStories',
              ...settingsData.emailSettings
            },
            generalSettings: {
              postsPerPage: 12,
              commentsEnabled: true,
              registrationEnabled: true,
              maintenanceMode: false,
              ...settingsData.generalSettings
            },
            theme: {
              primaryColor: '#3B82F6',
              secondaryColor: '#8B5CF6',
              ...settingsData.theme
            },
            emailTemplates: {
              contributorSubmission: {
                subject: 'New Post Submitted for Review - {{postTitle}}',
                htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333;">New Post Submitted for Review</h2>
                  <p>Hello Admin Team,</p>
                  <p>A new blog post has been submitted for review by <strong>{{contributorName}}</strong>.</p>
                  
                  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #333;">Post Details:</h3>
                    <p><strong>Title:</strong> {{postTitle}}</p>
                    <p><strong>Author:</strong> {{contributorName}} ({{contributorEmail}})</p>
                    <p><strong>Category:</strong> {{postCategory}}</p>
                    <p><strong>Submitted:</strong> {{submissionDate}}</p>
                  </div>
                  
                  <p>Please review and take appropriate action in the admin panel.</p>
                  
                  <div style="margin: 30px 0;">
                    <a href="{{adminPanelUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                      Review Post in Admin Panel
                    </a>
                  </div>
                  
                  <p>Best regards,<br>BagPackStories Team</p>
                </div>`,
                textContent: `New Post Submitted for Review

Hello Admin Team,

A new blog post has been submitted for review by {{contributorName}}.

Post Details:
- Title: {{postTitle}}
- Author: {{contributorName}} ({{contributorEmail}})
- Category: {{postCategory}}
- Submitted: {{submissionDate}}

Please review and take appropriate action in the admin panel: {{adminPanelUrl}}

Best regards,
BagPackStories Team`
              },
              postApproved: {
                subject: 'Your Post "{{postTitle}}" Has Been Approved!',
                htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #28a745;">🎉 Your Post Has Been Approved!</h2>
                  <p>Hello {{contributorName}},</p>
                  <p>Great news! Your blog post has been approved and is now published on BagPackStories.</p>
                  
                  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                    <h3 style="margin: 0 0 10px 0; color: #333;">Published Post:</h3>
                    <p><strong>Title:</strong> {{postTitle}}</p>
                    <p><strong>Category:</strong> {{postCategory}}</p>
                    <p><strong>Published Date:</strong> {{publishedDate}}</p>
                  </div>
                  
                  <p>Your story is now live and readers can discover your amazing content! Thank you for your valuable contribution to our travel community.</p>
                  
                  <div style="margin: 30px 0;">
                    <a href="{{postUrl}}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">
                      View Your Published Post
                    </a>
                    <a href="{{contributorPanelUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                      Contributor Dashboard
                    </a>
                  </div>
                  
                  <p>Keep sharing your travel experiences with our community!</p>
                  <p>Best regards,<br>BagPackStories Team</p>
                </div>`,
                textContent: `🎉 Your Post Has Been Approved!

Hello {{contributorName}},

Great news! Your blog post has been approved and is now published on BagPackStories.

Published Post:
- Title: {{postTitle}}
- Category: {{postCategory}}
- Published Date: {{publishedDate}}

Your story is now live and readers can discover your amazing content! Thank you for your valuable contribution to our travel community.

View your published post: {{postUrl}}
Contributor Dashboard: {{contributorPanelUrl}}

Keep sharing your travel experiences with our community!

Best regards,
BagPackStories Team`
              },
              weeklyNewsletter: {
                subject: 'Weekly Travel Inspiration - New Posts from BagPackStories',
                htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eee;">
                    <h1 style="color: #333; margin: 0;">BagPackStories</h1>
                    <p style="color: #666; margin: 5px 0 0 0;">Weekly Travel Inspiration</p>
                  </div>
                  
                  <div style="padding: 30px 20px;">
                    <h2 style="color: #333;">✈️ This Week's Travel Stories</h2>
                    <p>Hello {{subscriberName}},</p>
                    <p>Discover the amazing travel stories published this week on BagPackStories. Get inspired for your next adventure!</p>
                    
                    <div style="margin: 30px 0;">
                      {{weeklyPosts}}
                    </div>
                    
                    <div style="text-align: center; margin: 40px 0;">
                      <a href="{{websiteUrl}}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Visit BagPackStories
                      </a>
                    </div>
                    
                    <p>Happy travels!</p>
                    <p>Best regards,<br>The BagPackStories Team</p>
                  </div>
                  
                  <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
                    <p>You're receiving this email because you subscribed to BagPackStories newsletter.</p>
                    <p><a href="{{unsubscribeUrl}}" style="color: #666;">Unsubscribe</a> | <a href="{{websiteUrl}}" style="color: #666;">Visit Website</a></p>
                  </div>
                </div>`,
                textContent: `BagPackStories - Weekly Travel Inspiration

Hello {{subscriberName}},

This week's travel stories are here! Discover amazing destinations and get inspired for your next adventure.

{{weeklyPostsText}}

Visit BagPackStories: {{websiteUrl}}

Happy travels!
The BagPackStories Team

You're receiving this email because you subscribed to BagPackStories newsletter.
Unsubscribe: {{unsubscribeUrl}}`
              },
              ...settingsData.emailTemplates
            }
          }
          setSettings(completeSettings)
        }
      } catch (err) {
        console.error('Settings fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    if (!settings) return

    try {
      setSaving(true)
      const response = await adminApi.updateSettings(settings) as any
      
      if (response.success) {
        alert('Settings saved successfully!')
      }
    } catch (err) {
      console.error('Save settings error:', err)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (path: string, value: any) => {
    if (!settings) return

    const keys = path.split('.')
    const newSettings = { ...settings }
    let current: any = newSettings

    // Ensure nested objects exist
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value

    setSettings(newSettings)
  }

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'contact', name: 'Contact', icon: Phone },
    { id: 'seo', name: 'SEO', icon: Globe },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'theme', name: 'Theme', icon: Palette }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !settings) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">{error || 'Failed to load settings'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your website settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    id="siteName"
                    type="text"
                    value={settings.siteName || ''}
                    onChange={(e) => updateSettings('siteName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="siteUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Site URL
                  </label>
                  <input
                    id="siteUrl"
                    type="url"
                    value={settings.siteUrl || ''}
                    onChange={(e) => updateSettings('siteUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Site Description
                </label>
                <textarea
                  id="siteDescription"
                  rows={3}
                  value={settings.siteDescription || ''}
                  onChange={(e) => updateSettings('siteDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Comments Enabled</p>
                      <p className="text-sm text-gray-500">Allow users to comment on posts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.generalSettings?.commentsEnabled ?? true}
                      onChange={(e) => updateSettings('generalSettings.commentsEnabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">User Registration</p>
                      <p className="text-sm text-gray-500">Allow new user registration</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.generalSettings?.registrationEnabled ?? true}
                      onChange={(e) => updateSettings('generalSettings.registrationEnabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Maintenance Mode</p>
                      <p className="text-sm text-gray-500">Put the site in maintenance mode</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.generalSettings?.maintenanceMode ?? false}
                      onChange={(e) => updateSettings('generalSettings.maintenanceMode', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'contact' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      id="contactPhone"
                      type="tel"
                      value={settings.contactPhone || ''}
                      onChange={(e) => updateSettings('contactPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      id="contactEmail"
                      type="email"
                      value={settings.contactEmail || ''}
                      onChange={(e) => updateSettings('contactEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contact@yourdomain.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      id="street"
                      type="text"
                      value={settings.contactAddress?.street || ''}
                      onChange={(e) => updateSettings('contactAddress.street', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123 Travel Street"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={settings.contactAddress?.city || ''}
                      onChange={(e) => updateSettings('contactAddress.city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="San Francisco"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      id="state"
                      type="text"
                      value={settings.contactAddress?.state || ''}
                      onChange={(e) => updateSettings('contactAddress.state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="CA"
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      id="zipCode"
                      type="text"
                      value={settings.contactAddress?.zipCode || ''}
                      onChange={(e) => updateSettings('contactAddress.zipCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="94105"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      id="country"
                      type="text"
                      value={settings.contactAddress?.country || ''}
                      onChange={(e) => updateSettings('contactAddress.country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="USA"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Business Hours
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="monday" className="block text-sm font-medium text-gray-700 mb-2">
                      Monday
                    </label>
                    <input
                      id="monday"
                      type="text"
                      value={settings.businessHours?.monday || ''}
                      onChange={(e) => updateSettings('businessHours.monday', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="9:00 AM - 6:00 PM"
                    />
                  </div>
                  <div>
                    <label htmlFor="tuesday" className="block text-sm font-medium text-gray-700 mb-2">
                      Tuesday
                    </label>
                    <input
                      id="tuesday"
                      type="text"
                      value={settings.businessHours?.tuesday || ''}
                      onChange={(e) => updateSettings('businessHours.tuesday', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="9:00 AM - 6:00 PM"
                    />
                  </div>
                  <div>
                    <label htmlFor="wednesday" className="block text-sm font-medium text-gray-700 mb-2">
                      Wednesday
                    </label>
                    <input
                      id="wednesday"
                      type="text"
                      value={settings.businessHours?.wednesday || ''}
                      onChange={(e) => updateSettings('businessHours.wednesday', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="9:00 AM - 6:00 PM"
                    />
                  </div>
                  <div>
                    <label htmlFor="thursday" className="block text-sm font-medium text-gray-700 mb-2">
                      Thursday
                    </label>
                    <input
                      id="thursday"
                      type="text"
                      value={settings.businessHours?.thursday || ''}
                      onChange={(e) => updateSettings('businessHours.thursday', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="9:00 AM - 6:00 PM"
                    />
                  </div>
                  <div>
                    <label htmlFor="friday" className="block text-sm font-medium text-gray-700 mb-2">
                      Friday
                    </label>
                    <input
                      id="friday"
                      type="text"
                      value={settings.businessHours?.friday || ''}
                      onChange={(e) => updateSettings('businessHours.friday', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="9:00 AM - 6:00 PM"
                    />
                  </div>
                  <div>
                    <label htmlFor="saturday" className="block text-sm font-medium text-gray-700 mb-2">
                      Saturday
                    </label>
                    <input
                      id="saturday"
                      type="text"
                      value={settings.businessHours?.saturday || ''}
                      onChange={(e) => updateSettings('businessHours.saturday', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="10:00 AM - 4:00 PM"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="sunday" className="block text-sm font-medium text-gray-700 mb-2">
                      Sunday
                    </label>
                    <input
                      id="sunday"
                      type="text"
                      value={settings.businessHours?.sunday || ''}
                      onChange={(e) => updateSettings('businessHours.sunday', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Closed"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Support Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="supportEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Support Email
                    </label>
                    <input
                      id="supportEmail"
                      type="email"
                      value={settings.supportSettings?.email || ''}
                      onChange={(e) => updateSettings('supportSettings.email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="support@yourdomain.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="responseTime" className="block text-sm font-medium text-gray-700 mb-2">
                      Response Time
                    </label>
                    <input
                      id="responseTime"
                      type="text"
                      value={settings.supportSettings?.responseTime || ''}
                      onChange={(e) => updateSettings('supportSettings.responseTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Within 24 hours"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'seo' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  id="metaTitle"
                  type="text"
                  value={settings.seoSettings?.metaTitle || ''}
                  onChange={(e) => updateSettings('seoSettings.metaTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  id="metaDescription"
                  rows={3}
                  value={settings.seoSettings?.metaDescription || ''}
                  onChange={(e) => updateSettings('seoSettings.metaDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook URL
                    </label>
                    <input
                      id="facebook"
                      type="url"
                      value={settings.socialLinks.facebook || ''}
                      onChange={(e) => updateSettings('socialLinks.facebook', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter URL
                    </label>
                    <input
                      id="twitter"
                      type="url"
                      value={settings.socialLinks.twitter || ''}
                      onChange={(e) => updateSettings('socialLinks.twitter', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram URL
                    </label>
                    <input
                      id="instagram"
                      type="url"
                      value={settings.socialLinks.instagram || ''}
                      onChange={(e) => updateSettings('socialLinks.instagram', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="youtube" className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube URL
                    </label>
                    <input
                      id="youtube"
                      type="url"
                      value={settings.socialLinks.youtube || ''}
                      onChange={(e) => updateSettings('socialLinks.youtube', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn URL
                    </label>
                    <input
                      id="linkedin"
                      type="url"
                      value={settings.socialLinks.linkedin || ''}
                      onChange={(e) => updateSettings('socialLinks.linkedin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'email' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    From Email
                  </label>
                  <input
                    id="fromEmail"
                    type="email"
                    value={settings.emailSettings?.fromEmail || ''}
                    onChange={(e) => updateSettings('emailSettings.fromEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="fromName" className="block text-sm font-medium text-gray-700 mb-2">
                    From Name
                  </label>
                  <input
                    id="fromName"
                    type="text"
                    value={settings.emailSettings?.fromName || ''}
                    onChange={(e) => updateSettings('emailSettings.fromName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'theme' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="primaryColor"
                      type="color"
                      value={settings.theme?.primaryColor || '#3B82F6'}
                      onChange={(e) => updateSettings('theme.primaryColor', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.theme?.primaryColor || '#3B82F6'}
                      onChange={(e) => updateSettings('theme.primaryColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="secondaryColor"
                      type="color"
                      value={settings.theme?.secondaryColor || '#8B5CF6'}
                      onChange={(e) => updateSettings('theme.secondaryColor', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.theme?.secondaryColor || '#8B5CF6'}
                      onChange={(e) => updateSettings('theme.secondaryColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
