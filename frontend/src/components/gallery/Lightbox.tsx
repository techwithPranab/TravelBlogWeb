'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { AnimatePresence } from 'framer-motion'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  MapPin,
  Calendar,
  User,
  Camera,
  ZoomIn,
  ZoomOut
} from 'lucide-react'

interface Photo {
  _id: string
  title: string
  description: string
  location: {
    country: string
    city: string
  }
  tags: string[]
  imageUrl: string
  thumbnailUrl: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  photographer?: {
    name: string
    email: string
  }
}

interface LightboxProps {
  photos: Photo[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  onSelectPhoto: (index: number) => void
}

export function Lightbox({ photos, currentIndex, isOpen, onClose, onNext, onPrev, onSelectPhoto }: LightboxProps) {
  // Temporarily disabled due to build issues
  // TODO: Re-enable once framer-motion SSR issues are resolved
  return null
}
