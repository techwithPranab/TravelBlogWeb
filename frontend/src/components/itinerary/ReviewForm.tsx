'use client'

import React, { useState } from 'react'
import { CreateReviewData, ReviewModerationResult } from '@/types'
import { Star, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { validateReviewContent } from '@/lib/reviewsApi'

interface ReviewFormProps {
  itineraryId: string
  itineraryTitle: string
  onSubmit: (data: CreateReviewData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export default function ReviewForm({ itineraryId, itineraryTitle, onSubmit, onCancel, isLoading = false }: ReviewFormProps) {
  const [formData, setFormData] = useState<CreateReviewData>({
    itineraryId,
    rating: 0,
    title: '',
    comment: '',
    tripDate: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [moderationResult, setModerationResult] = useState<ReviewModerationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating'
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Review title is required'
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters'
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters'
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Review comment is required'
    } else {
      const wordCount = formData.comment.trim().split(/\s+/).length
      const charCount = formData.comment.trim().length
      if (wordCount < 10) {
        newErrors.comment = 'Review must be at least 10 words long'
      } else if (charCount < 30) {
        newErrors.comment = 'Review must be at least 30 characters long'
      } else if (wordCount > 500) {
        newErrors.comment = 'Review cannot exceed 500 words'
      }
    }

    if (formData.tripDate && new Date(formData.tripDate) > new Date()) {
      newErrors.tripDate = 'Trip date cannot be in the future'
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    return isValid
  }

  const validateContent = async (title: string, comment: string): Promise<ReviewModerationResult> => {
    try {
      const result = await validateReviewContent(title, comment)
      console.log('Content validation result:', result);
      return {
        isValid: result.isValid,
        violations: (result.violations || []).map(v => typeof v === 'string' ? v : v.message || 'Inappropriate content detected'),
        wordCount: result.wordCount
      }
    } catch (error) {
      console.error('Content validation error:', error)
      return {
        isValid: true, // Allow submission if validation fails
        violations: [],
        wordCount: comment.trim().split(/\s+/).length
      }
    }
  }

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }))
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }))
    }
  }

  const handleInputChange = (field: keyof CreateReviewData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Clear moderation result when content changes
    if (field === 'title' || field === 'comment') {
      setModerationResult(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsValidating(true)
    try {
      const validation = await validateContent(formData.title, formData.comment)
      setModerationResult(validation)
      
      if (!validation.isValid) {
        setErrors({
          comment: `Content contains inappropriate content: ${(validation.violations || []).join(', ')}`
        })
        return
      }

      await onSubmit(formData)
    } catch (error) {
      console.error('ReviewForm: Form submission error:', error)
    } finally {
      setIsValidating(false)
    }
  }

  const wordCount = formData.comment.trim().split(/\s+/).filter(word => word.length > 0).length

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Write a Review</h2>
        <p className="text-gray-600">
          Share your experience with <span className="font-medium">{itineraryTitle}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Overall Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                disabled={isLoading || isValidating}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= formData.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.rating}
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Review Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Summarize your experience..."
            disabled={isLoading || isValidating}
            maxLength={100}
          />
          <div className="flex justify-between mt-1">
            {errors.title && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
            <span className="text-sm text-gray-500 ml-auto">
              {formData.title.length}/100
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            value={formData.comment}
            onChange={(e) => handleInputChange('comment', e.target.value)}
            rows={6}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errors.comment ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Tell others about your trip experience. What did you love? What could be improved? Share your tips and recommendations..."
            disabled={isLoading || isValidating}
            maxLength={3000}
          />
          <div className="flex justify-between mt-1">
            {errors.comment && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.comment}
              </p>
            )}
            <div className="text-sm text-gray-500 ml-auto flex gap-4">
              <span>{wordCount} words</span>
              <span>{formData.comment.trim().length} chars</span>
              <span>Min: 10 words / 30 chars</span>
            </div>
          </div>
        </div>

        {/* Trip Date */}
        <div>
          <label htmlFor="tripDate" className="block text-sm font-medium text-gray-700 mb-2">
            When did you take this trip? (Optional)
          </label>
          <input
            type="date"
            id="tripDate"
            value={formData.tripDate}
            onChange={(e) => handleInputChange('tripDate', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.tripDate ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading || isValidating}
          />
          {errors.tripDate && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.tripDate}
            </p>
          )}
        </div>

        {/* Moderation Status */}
        {moderationResult && (
          <div className={`p-4 rounded-md ${
            moderationResult.isValid
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {moderationResult.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={`font-medium ${
                moderationResult.isValid ? 'text-green-800' : 'text-red-800'
              }`}>
                {moderationResult.isValid ? 'Content Approved' : 'Content Rejected'}
              </span>
            </div>
            {moderationResult.violations && moderationResult.violations.length > 0 && (
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {moderationResult.violations.map((violation, index) => (
                  <li key={index}>{violation}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading || isValidating || !formData.rating || !formData.title.trim() || !formData.comment.trim()}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Validating...
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading || isValidating}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Review Guidelines</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Be honest and specific about your experience</li>
            <li>• Focus on facts and avoid offensive language</li>
            <li>• Minimum 10 words, maximum 500 words</li>
            <li>• Reviews are moderated before being published</li>
            <li>• Help others make informed travel decisions</li>
          </ul>
        </div>
      </form>
    </div>
  )
}
