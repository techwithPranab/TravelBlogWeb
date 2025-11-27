'use client'

import { useState } from 'react'
import { 
  Plus, 
  Trash2, 
  Upload, 
  Move, 
  Eye, 
  EyeOff,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Type,
  FileText,
  X
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface ContentSection {
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
}

interface ContentSectionManagerProps {
  sections: ContentSection[]
  onChange: (sections: ContentSection[]) => void
  authToken?: string
}

export default function ContentSectionManager({ sections, onChange, authToken }: ContentSectionManagerProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const generateId = () => `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const addSection = (type: ContentSection['type']) => {
    const newSection: ContentSection = {
      id: generateId(),
      type,
      title: '',
      content: '',
      imagePosition: 'left',
      order: sections.length
    }

    if (type === 'image-text' || type === 'image-only') {
      newSection.image = {
        url: '',
        alt: '',
        caption: ''
      }
    }

    const updatedSections = [...sections, newSection]
    onChange(updatedSections)
    setExpandedSections(prev => new Set(Array.from(prev).concat(newSection.id)))
  }

  const updateSection = (id: string, updates: Partial<ContentSection>) => {
    const updatedSections = sections.map(section =>
      section.id === id ? { ...section, ...updates } : section
    )
    onChange(updatedSections)
  }

  const deleteSection = (id: string) => {
    const updatedSections = sections.filter(section => section.id !== id)
      .map((section, index) => ({ ...section, order: index }))
    onChange(updatedSections)
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(section => section.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= sections.length) return

    const updatedSections = [...sections]
    const [movedSection] = updatedSections.splice(currentIndex, 1)
    updatedSections.splice(newIndex, 0, movedSection)

    // Update order numbers
    const reorderedSections = updatedSections.map((section, index) => ({
      ...section,
      order: index
    }))

    onChange(reorderedSections)
  }

  const toggleExpanded = (id: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleImageUpload = async (sectionId: string, file: File) => {
    // Show loading state
    const loadingToast = toast.loading('Uploading image...')

    try {
      // Create FormData for file upload
      const uploadFormData = new FormData()
      uploadFormData.append('image', file)

      // Get auth token - use prop if provided, otherwise try localStorage
      const token = authToken || localStorage.getItem('adminToken') || localStorage.getItem('token')

      // Upload to our API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()

      if (result.success) {
        updateSection(sectionId, {
          image: {
            url: result.data.url,
            alt: file.name,
            caption: ''
          }
        })
        toast.success('Image uploaded successfully')
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image. Please try again.')
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  }

  const getSectionIcon = (type: ContentSection['type']) => {
    switch (type) {
      case 'text':
        return <Type className="w-4 h-4" />
      case 'image-only':
        return <ImageIcon className="w-4 h-4" />
      case 'image-text':
        return <FileText className="w-4 h-4" />
      default:
        return <Type className="w-4 h-4" />
    }
  }

  const getSectionLabel = (type: ContentSection['type']) => {
    switch (type) {
      case 'text':
        return 'Text Only'
      case 'image-only':
        return 'Image Only'
      case 'image-text':
        return 'Image + Text'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Content Sections</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => addSection('text')}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Type className="w-4 h-4 mr-1" />
            Text
          </button>
          <button
            type="button"
            onClick={() => addSection('image-text')}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FileText className="w-4 h-4 mr-1" />
            Image + Text
          </button>
          <button
            type="button"
            onClick={() => addSection('image-only')}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ImageIcon className="w-4 h-4 mr-1" />
            Image Only
          </button>
        </div>
      </div>

      {sections.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No content sections yet. Add your first section above.</p>
        </div>
      )}

      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={section.id} className="border border-gray-200 rounded-lg">
            {/* Section Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => toggleExpanded(section.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {expandedSections.has(section.id) ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <div className="flex items-center space-x-2">
                  {getSectionIcon(section.type)}
                  <span className="text-sm font-medium text-gray-900">
                    {getSectionLabel(section.type)}
                  </span>
                  {section.title && (
                    <span className="text-sm text-gray-500">- {section.title}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">#{index + 1}</span>
                <button
                  type="button"
                  onClick={() => moveSection(section.id, 'up')}
                  disabled={index === 0}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(section.id, 'down')}
                  disabled={index === sections.length - 1}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteSection(section.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Section Content */}
            {expandedSections.has(section.id) && (
              <div className="p-4 space-y-4">
                {/* Section Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={section.title || ''}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    placeholder="Enter section title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Image Upload (for image-text and image-only sections) */}
                {(section.type === 'image-text' || section.type === 'image-only') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image
                    </label>
                    
                    {section.image?.url ? (
                      <div className="space-y-3">
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                          <Image
                            src={section.image.url}
                            alt={section.image.alt || 'Section image'}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => updateSection(section.id, { image: undefined })}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Alt Text
                            </label>
                            <input
                              type="text"
                              value={section.image.alt || ''}
                              onChange={(e) => updateSection(section.id, {
                                image: { ...section.image!, alt: e.target.value }
                              })}
                              placeholder="Image description..."
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Caption (Optional)
                            </label>
                            <input
                              type="text"
                              value={section.image.caption || ''}
                              onChange={(e) => updateSection(section.id, {
                                image: { ...section.image!, caption: e.target.value }
                              })}
                              placeholder="Image caption..."
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <div>
                          <label className="cursor-pointer">
                            <span className="text-sm text-blue-600 hover:text-blue-500">
                              Upload image
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(section.id, file)
                              }}
                            />
                          </label>
                          <p className="text-sm text-gray-500">or paste image URL</p>
                        </div>
                        <div className="mt-3">
                          <input
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            onBlur={(e) => {
                              if (e.target.value) {
                                updateSection(section.id, {
                                  image: {
                                    url: e.target.value,
                                    alt: '',
                                    caption: ''
                                  }
                                })
                                e.target.value = ''
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Image Position (for image-text sections) */}
                    {section.type === 'image-text' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image Position
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {(['left', 'right', 'center', 'full-width'] as const).map((position) => (
                            <button
                              key={position}
                              type="button"
                              onClick={() => updateSection(section.id, { imagePosition: position })}
                              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                                section.imagePosition === position
                                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {position.charAt(0).toUpperCase() + position.slice(1).replace('-', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Content Editor */}
                {section.type !== 'image-only' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <div className="border border-gray-300 rounded-md">
                      <ReactQuill
                        theme="snow"
                        value={section.content}
                        onChange={(content) => updateSection(section.id, { content })}
                        modules={quillModules}
                        placeholder="Write your content here..."
                        style={{ minHeight: '200px' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
