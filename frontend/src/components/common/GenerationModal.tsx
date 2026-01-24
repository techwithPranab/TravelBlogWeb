'use client'

import React, { useEffect, useState } from 'react'

interface GenerationModalProps {
  open: boolean
  title?: string
  onClose?: () => void
  messages?: string[]
}

export default function GenerationModal({ open, title = 'Generating your itinerary', onClose, messages }: GenerationModalProps) {
  const defaultMessages = messages || [
    "Scouting local secrets and offbeat spots ✨",
    "Fine-tuning timings for golden hour photos 📸",
    "Packing family-friendly stops and kid-approved breaks 👨‍👩‍👧‍👦",
    "Checking seasonal weather and local festivals 🎉",
    "Finding the most efficient route and transport hacks 🧭",
    "Optimizing for your travel style and budget 💵",
    "Squeezing in hidden gems where locals go 🤫",
    "Negotiating imaginary discounts — just for you 😎"
  ]

  const [messageIndex, setMessageIndex] = useState(() => Math.floor(Math.random() * defaultMessages.length))

  useEffect(() => {
    if (!open) return
    const handle = setInterval(() => {
      setMessageIndex((i) => (i + 1) % defaultMessages.length)
    }, 4000)
    return () => clearInterval(handle)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden />
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white rounded-lg shadow-lg border p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <svg className="animate-spin h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>

          <p className="text-sm text-gray-600 mb-4">{defaultMessages[messageIndex]}</p>

          <div className="mt-3">
            <div className="text-xs text-gray-400">This may take a moment — we’re crafting a personalized plan just for you.</div>
          </div>

          <div className="mt-4 text-xs text-gray-500">Tip: Make sure your network connection is stable. We’ll redirect you when it’s ready.</div>

        </div>
      </div>
    </div>
  )
}
