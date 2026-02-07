'use client'

import React, { useState } from 'react'
import { Download, Mail, Check, AlertCircle } from 'lucide-react'
import { downloadItineraryPDF, emailItinerary } from '@/lib/itineraryApi'

interface ItineraryActionsProps {
  itineraryId: string
  itineraryTitle: string
  isPremium: boolean
  onUpgradeClick?: () => void
}

export const ItineraryActions: React.FC<ItineraryActionsProps> = ({
  itineraryId,
  itineraryTitle,
  isPremium,
  onUpgradeClick
}) => {
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleDownloadPDF = async () => {
    if (!isPremium && onUpgradeClick) {
      onUpgradeClick()
      return
    }

    setIsDownloading(true)
    setErrorMessage('')

    try {
      const blob = await downloadItineraryPDF(itineraryId)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${itineraryTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to download PDF')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleEmailItinerary = async () => {
    if (!isPremium && onUpgradeClick) {
      onUpgradeClick()
      return
    }

    setShowEmailModal(true)
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setErrorMessage('Please enter an email address')
      return
    }

    setIsSending(true)
    setEmailStatus('idle')
    setErrorMessage('')

    try {
      const result = await emailItinerary(itineraryId, { to: email, message })
      
      if (result.success) {
        setEmailStatus('success')
        setTimeout(() => {
          setShowEmailModal(false)
          setEmail('')
          setMessage('')
          setEmailStatus('idle')
        }, 2000)
      } else {
        setEmailStatus('error')
        setErrorMessage(result.message || 'Failed to send email')
      }
    } catch (error: any) {
      setEmailStatus('error')
      setErrorMessage(error.message || 'Failed to send email')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <div className="flex gap-3">
        {/* Download PDF Button */}
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isPremium
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isDownloading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download PDF
              {!isPremium && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full ml-1">Premium</span>}
            </>
          )}
        </button>

        {/* Email Button */}
        <button
          onClick={handleEmailItinerary}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isPremium
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          <Mail className="w-4 h-4" />
          Email Itinerary
          {!isPremium && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full ml-1">Premium</span>}
        </button>
      </div>

      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            {emailStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold font-serif text-gray-900 mb-2">Email Sent!</h3>
                <p className="text-gray-600">Your itinerary has been sent successfully.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold font-serif text-gray-900">Email Itinerary</h3>
                  <button
                    onClick={() => {
                      setShowEmailModal(false)
                      setEmail('')
                      setMessage('')
                      setEmailStatus('idle')
                      setErrorMessage('')
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSendEmail}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="recipient@example.com"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personal Message (Optional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Add a personal message to include in the email..."
                    />
                  </div>

                  {emailStatus === 'error' && errorMessage && (
                    <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmailModal(false)
                        setEmail('')
                        setMessage('')
                        setEmailStatus('idle')
                        setErrorMessage('')
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSending}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          Send Email
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default ItineraryActions
