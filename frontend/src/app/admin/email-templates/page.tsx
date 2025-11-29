'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Edit3, Eye, TestTube, Plus, Trash2, Mail } from 'lucide-react'
import { adminApi } from '@/lib/adminApi'

interface EmailTemplate {
  _id: string
  name: string
  key: string
  subject: string
  htmlContent: string
  textContent: string
  variables: string[]
  type: 'contributor_submission' | 'post_approved' | 'weekly_newsletter' | 'custom'
  isActive: boolean
  description?: string
  createdAt: string
  updatedAt: string
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [templatePreviewMode, setTemplatePreviewMode] = useState<'html' | 'text'>('html')
  const [sendingTestEmail, setSendingTestEmail] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiUrl}/admin/email-templates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.data || [])
      } else {
        setError('Failed to load email templates')
      }
    } catch (err) {
      console.error('Templates fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return

    try {
      setSaving(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiUrl}/admin/email-templates/${editingTemplate._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(editingTemplate)
      })
      
      if (response.ok) {
        const data = await response.json()
        setTemplates(prev => prev.map(t => t._id === editingTemplate._id ? data.data : t))
        setEditingTemplate(null)
        alert('Template saved successfully!')
      } else {
        alert('Failed to save template')
      }
    } catch (err) {
      console.error('Save template error:', err)
      alert('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  const handleSendTestEmail = async (templateKey: string) => {
    setSendingTestEmail(true)
    try {
      const testEmail = prompt('Enter test email address:') || 'admin@bagpackstories.in'
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiUrl}/admin/test-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          templateType: templateKey,
          testEmail
        })
      })
      if (response.ok) {
        alert('Test email sent successfully!')
      } else {
        alert('Failed to send test email')
      }
    } catch (error) {
      alert('Error sending test email')
    } finally {
      setSendingTestEmail(false)
    }
  }

  const updateTemplate = (field: string, value: any) => {
    if (!editingTemplate) return
    setEditingTemplate({ ...editingTemplate, [field]: value })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (editingTemplate) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Email Template</h1>
            <p className="text-gray-600 mt-1">{editingTemplate.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditingTemplate(null)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSendTestEmail(editingTemplate.key)}
              disabled={sendingTestEmail}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <TestTube className="h-4 w-4" />
              {sendingTestEmail ? 'Sending...' : 'Send Test'}
            </button>
            <button
              onClick={handleSaveTemplate}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">{editingTemplate.name}</h4>
              <button
                onClick={() => setTemplatePreviewMode(templatePreviewMode === 'html' ? 'text' : 'html')}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                <Eye className="h-3 w-3" />
                {templatePreviewMode === 'html' ? 'Switch to Text' : 'Switch to HTML'}
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) => updateTemplate('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editingTemplate.isActive ? 'active' : 'inactive'}
                  onChange={(e) => updateTemplate('isActive', e.target.value === 'active')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={editingTemplate.description || ''}
                onChange={(e) => updateTemplate('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Template description..."
              />
            </div>

            {/* Subject Line */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject
              </label>
              <input
                type="text"
                value={editingTemplate.subject}
                onChange={(e) => updateTemplate('subject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email subject..."
              />
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {templatePreviewMode === 'html' ? 'HTML Content' : 'Text Content'}
              </label>
              <textarea
                rows={templatePreviewMode === 'html' ? 20 : 12}
                value={templatePreviewMode === 'html' ? editingTemplate.htmlContent : editingTemplate.textContent}
                onChange={(e) => updateTemplate(
                  templatePreviewMode === 'html' ? 'htmlContent' : 'textContent',
                  e.target.value
                )}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder={templatePreviewMode === 'html' ? 'Enter HTML content...' : 'Enter plain text content...'}
              />
            </div>

            {/* Available Variables */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Available Variables</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {editingTemplate.variables.map((variable, index) => (
                  <code key={index} className="bg-blue-100 px-2 py-1 rounded text-blue-800">
                    {`{{${variable}}}`}
                  </code>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600 mt-1">Manage email templates for notifications and newsletters</p>
        </div>
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {templates.map((template) => (
          <motion.div
            key={template._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{template.description}</p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      template.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {template.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <Mail className="h-6 w-6 text-gray-400" />
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Subject:</strong> {template.subject}
                </p>
                <div className="flex flex-wrap gap-1">
                  {template.variables.slice(0, 3).map((variable, index) => (
                    <code key={index} className="bg-gray-100 px-1 py-0.5 rounded text-xs text-gray-600">
                      {`{{${variable}}}`}
                    </code>
                  ))}
                  {template.variables.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{template.variables.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setEditingTemplate(template)}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleSendTestEmail(template.key)}
                  disabled={sendingTestEmail}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <TestTube className="h-3 w-3" />
                  Test
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
