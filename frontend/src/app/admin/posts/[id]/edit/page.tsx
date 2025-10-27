'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  Save, 
  Eye, 
  Upload, 
  X, 
  Plus,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'
import { toast } from 'react-hot-toast'
import dynamic from 'next/dynamic'
import ContentSectionManager from '@/components/admin/ContentSectionManager'
import ContentSection from '@/components/blog/ContentSection'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [previewMode, setPreviewMode] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [contentSections, setContentSections] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    featuredImage: {
      url: '',
      alt: '',
      caption: ''
    },
    images: [] as string[],
    category: '',
    destination: '',
    status: 'draft',
    isFeatured: false,
    seoTitle: '',
    seoDescription: '',
    publishedAt: ''
  })

  const categories = [
    'Adventure',
    'Culture',
    'Food',
    'Nature',
    'City Guide',
    'Budget Travel',
    'Luxury Travel',
    'Backpacking',
    'Family Travel',
    'Solo Travel'
  ]

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ],
  }

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'script',
    'indent', 'align', 'blockquote', 'code-block',
    'link', 'image', 'video'
  ]

  useEffect(() => {
    if (postId) {
      loadPost()
    }
  }, [postId])

  const loadPost = async () => {
    try {
      setInitialLoading(true)
      const response: any = await adminApi.getPost(postId)
      const post = response.data
      
      setFormData({
        title: post.title || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        featuredImage: post.featuredImage ? {
          url: post.featuredImage.url || '',
          alt: post.featuredImage.alt || '',
          caption: post.featuredImage.caption || ''
        } : {
          url: '',
          alt: '',
          caption: ''
        },
        images: post.images || [],
        category: post.category || '',
        destination: post.destination || '',
        status: post.status || 'draft',
        isFeatured: post.isFeatured || false,
        seoTitle: post.seo?.title || '',
        seoDescription: post.seo?.description || '',
        publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : ''
      })
      
      setTags(post.tags || [])
      setContentSections(post.contentSections || [])
    } catch (error) {
      toast.error('Failed to load post')
      console.error('Error loading post:', error)
      router.push('/admin/posts')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show loading state
    const loadingToast = toast.loading('Uploading image...')

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('image', file)

      // Upload to our API endpoint
      const response = await fetch('http://localhost:5000/api/posts/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          featuredImage: {
            url: result.data.url,
            alt: prev.title || 'Featured image',
            caption: ''
          }
        }))
        toast.success('Featured image uploaded successfully')
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

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const loadingToast = toast.loading(`Uploading ${files.length} image(s)...`)
    const newImageUrls: string[] = []

    try {
      // Upload each file to Cloudinary
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('image', file)

        const response = await fetch('http://localhost:5000/api/posts/upload-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: formData
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        const result = await response.json()
        if (result.success) {
          newImageUrls.push(result.data.url)
        } else {
          throw new Error(result.error || `Failed to upload ${file.name}`)
        }
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImageUrls]
      }))
      toast.success(`${files.length} image(s) uploaded successfully`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload some images. Please try again.')
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    toast.success('Image removed successfully')
  }

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published') => {
    e.preventDefault()
    setLoading(true)

    try {
      const postData: any = {
        ...formData,
        status,
        tags,
        contentSections,
        publishedAt: status === 'published' ? new Date().toISOString() : (formData.publishedAt && formData.publishedAt.trim() ? new Date(formData.publishedAt).toISOString() : undefined)
      }

      // Remove undefined fields
      Object.keys(postData).forEach(key => {
        if (postData[key] === undefined) {
          delete postData[key]
        }
      })

      console.log('Sending post data:', postData)
      console.log('isFeatured value:', postData.isFeatured)

      await adminApi.updatePost(postId, postData)
      toast.success(`Post ${status === 'published' ? 'published' : 'updated'} successfully!`)
      router.push('/admin/posts')
    } catch (error) {
      toast.error('Failed to update post')
      console.error('Error updating post:', error)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading post...</span>
        </div>
      </div>
    )
  }

  if (previewMode) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Preview Mode</h1>
          <button
            onClick={() => setPreviewMode(false)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <X className="h-4 w-4" />
            Exit Preview
          </button>
        </div>
        <div className="max-w-7xl mx-auto p-8">
          {formData.featuredImage.url && (
            <img 
              src={formData.featuredImage.url} 
              alt={formData.featuredImage.alt || formData.title}
              className="w-full h-96 md:h-[600px] object-cover rounded-2xl mb-8"
            />
          )}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-black leading-tight">
            {formData.title || 'Untitled Post'}
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {formData.excerpt}
          </p>

          {/* Content Sections */}
          {contentSections && contentSections.length > 0 ? (
            <div className="mb-12">
              {contentSections.map((section) => (
                <ContentSection
                  key={section.id}
                  section={section}
                  onImageClick={(imageUrl: string) => {
                    // Simple lightbox for preview
                    const lightbox = document.createElement('div')
                    lightbox.className = 'fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4'
                    lightbox.innerHTML = `
                      <div class="relative max-w-5xl max-h-full">
                        <button class="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70" onclick="this.parentElement.parentElement.remove()">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                        <img src="${imageUrl}" alt="Preview image" class="max-w-full max-h-[80vh] object-contain" />
                      </div>
                    `
                    document.body.appendChild(lightbox)
                  }}
                />
              ))}
            </div>
          ) : (
            /* Fallback to traditional content */
            <div className="prose prose-xl max-w-none mb-12 text-black">
              <div dangerouslySetInnerHTML={{ __html: formData.content }} />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/posts')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Posts
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
                <p className="text-gray-600 mt-1">Update your blog post</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPreviewMode(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
              <button
                onClick={(e) => handleSubmit(e, 'draft')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </button>
              <button
                onClick={(e) => handleSubmit(e, 'published')}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Update & Publish
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form className="p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Post Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter post title..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-black"
                  required
                />
              </div>

              {/* Excerpt */}
              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Brief description of the post..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                    modules={modules}
                    formats={formats}
                    placeholder="Write your post content here..."
                    className="bg-white"
                    style={{ minHeight: '400px' }}
                  />
                </div>
              </div>

              {/* Content Sections */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <ContentSectionManager
                  sections={contentSections}
                  onChange={setContentSections}
                />
              </div>

              {/* SEO Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      id="seoTitle"
                      name="seoTitle"
                      value={formData.seoTitle}
                      onChange={handleInputChange}
                      placeholder="SEO optimized title..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Description
                    </label>
                    <textarea
                      id="seoDescription"
                      name="seoDescription"
                      value={formData.seoDescription}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="SEO meta description..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                <div className="space-y-4">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  
                  {/* Featured Post Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                      Mark as Featured Post
                    </label>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Image</h3>
                {formData.featuredImage.url ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img 
                        src={formData.featuredImage.url} 
                        alt={formData.featuredImage.alt || "Featured"} 
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          featuredImage: { url: '', alt: '', caption: '' } 
                        }))}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="featuredImageAlt" className="block text-sm font-medium text-gray-700 mb-1">
                          Alt Text *
                        </label>
                        <input
                          type="text"
                          id="featuredImageAlt"
                          value={formData.featuredImage.alt}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            featuredImage: {
                              ...prev.featuredImage,
                              alt: e.target.value
                            }
                          }))}
                          placeholder="Describe the image for accessibility..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="featuredImageCaption" className="block text-sm font-medium text-gray-700 mb-1">
                          Caption (Optional)
                        </label>
                        <input
                          type="text"
                          id="featuredImageCaption"
                          value={formData.featuredImage.caption}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            featuredImage: {
                              ...prev.featuredImage,
                              caption: e.target.value
                            }
                          }))}
                          placeholder="Image caption..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or WEBP</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
              </div>

              {/* Additional Images */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Images</h3>
                <div className="space-y-4">
                  {/* Display uploaded images */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {formData.images.map((image, index) => (
                        <div key={`${image}-${index}`} className="relative">
                          <img 
                            src={image} 
                            alt={`Gallery item ${index + 1}`} 
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload new images */}
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-6 h-6 mb-2 text-gray-500" />
                      <p className="mb-1 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload additional images</span>
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or WEBP (multiple files allowed)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      multiple 
                      onChange={handleMultipleImageUpload} 
                    />
                  </label>
                </div>
              </div>

              {/* Category */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category</h3>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Destination */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Destination</h3>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder="e.g., Paris, France"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>

              {/* Tags */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Publish Date */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Publish Date</h3>
                <input
                  type="datetime-local"
                  name="publishedAt"
                  value={formData.publishedAt}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
