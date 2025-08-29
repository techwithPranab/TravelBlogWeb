


'use client'
import { useState } from 'react'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: name || undefined,
          source: 'homepage'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setMessage(data.message || 'Successfully subscribed to newsletter!')
        setEmail('')
        setName('')
      } else {
        setIsSuccess(false)
        setMessage(data.error || 'Failed to subscribe. Please try again.')
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setIsSuccess(false)
      setMessage('Failed to subscribe. Please check your internet connection.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-fade-up text-center text-white">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Stay Updated
      </h2>
      <p className="text-xl mb-8 text-white/90">
        Get the latest travel stories and tips delivered to your inbox
      </p>
      
      {message && (
        <div className={`max-w-md mx-auto mb-6 p-3 rounded-lg ${
          isSuccess 
            ? 'bg-green-500/20 border border-green-500/30 text-green-100' 
            : 'bg-red-500/20 border border-red-500/30 text-red-100'
        }`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        <input
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
        />
        <div className="flex">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={isLoading || !email}
            className="bg-white text-gray-900 px-6 py-3 rounded-r-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
      </form>
    </div>
  )
}
