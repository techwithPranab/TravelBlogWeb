'use client'

import React, { useState } from 'react'
import { Itinerary, DayPlan, Activity } from '@/types/itinerary'
import { jsPDF } from 'jspdf'
import { emailItinerary } from '@/lib/itineraryApi'
import WeatherWidget from './WeatherWidget'

interface ItineraryDisplayProps {
  itinerary: Itinerary
  onEdit?: () => void
  onDelete?: () => void
  onRegenerate?: () => void
  onShare?: () => void
}

export default function ItineraryDisplay({
  itinerary,
  onEdit,
  onDelete,
  onRegenerate,
  onShare
}: ItineraryDisplayProps) {
  const [activeDay, setActiveDay] = useState(1)
  const [showExport, setShowExport] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailError, setEmailError] = useState('')

  // Helper function to format cost with proper currency
  const formatCost = (cost: any): string => {
    // If cost is already a string with currency symbol, return as is
    if (typeof cost === 'string') {
      return cost
    }
    // Otherwise format with currency symbol
    const symbol = itinerary.currencySymbol || '$'
    return `${symbol}${typeof cost === 'number' ? cost.toLocaleString() : cost}`
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    let yPos = 20
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20

    // Helper function to check if we need a new page
    const checkPageBreak = (requiredSpace: number) => {
      if (yPos + requiredSpace > pageHeight - 20) {
        doc.addPage()
        yPos = 20
        return true
      }
      return false
    }

    // Helper function to add colored box background
    const addColoredBox = (x: number, y: number, width: number, height: number, color: [number, number, number]) => {
      doc.setFillColor(color[0], color[1], color[2])
      doc.rect(x, y, width, height, 'F')
    }

    // Helper function to wrap text
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 5) => {
      const lines = doc.splitTextToSize(text, maxWidth)
      doc.text(lines, x, y)
      return lines.length * lineHeight
    }

    // ========== COVER PAGE ==========
    // Gradient-like header (blue)
    addColoredBox(0, 0, pageWidth, 60, [59, 130, 246]) // Blue
    addColoredBox(0, 60, pageWidth, 20, [96, 165, 250]) // Lighter blue

    // Title
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    const titleLines = doc.splitTextToSize(itinerary.title, pageWidth - 40)
    doc.text(titleLines, pageWidth / 2, 35, { align: 'center' })

    // Route
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    const destinations = itinerary.destinations && itinerary.destinations.length > 0
      ? itinerary.destinations.length === 1
        ? itinerary.destinations[0]
        : itinerary.destinations.join(', ')
      : 'Multiple Destinations'
    doc.text(`${itinerary.source} → ${destinations}`, pageWidth / 2, 70, { align: 'center' })

    // Summary Box
    yPos = 95
    doc.setTextColor(0, 0, 0)
    addColoredBox(margin, yPos, pageWidth - 2 * margin, 50, [243, 244, 246]) // Light gray
    
    yPos += 10
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(59, 130, 246) // Blue
    doc.text('Trip Overview', margin + 5, yPos)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    yPos += 8
    doc.text(`Duration: ${itinerary.duration} days`, margin + 5, yPos)
    doc.text(`Budget Level: ${itinerary.budget.charAt(0).toUpperCase() + itinerary.budget.slice(1)}`, pageWidth / 2, yPos)
    
    yPos += 7
    doc.text(`Travel Style: ${itinerary.travelStyle.charAt(0).toUpperCase() + itinerary.travelStyle.slice(1)}`, margin + 5, yPos)
    doc.text(`Travelers: ${itinerary.adults} Adult(s), ${itinerary.children} Child(ren)`, pageWidth / 2, yPos)
    
    yPos += 7
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(34, 197, 94) // Green
    doc.text(`Total Cost: ${formatCost(itinerary.totalEstimatedCost)} ${itinerary.currency || 'USD'}`, margin + 5, yPos)

    // Interests
    if (itinerary.interests && itinerary.interests.length > 0) {
      yPos += 15
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(0, 0, 0)
      doc.text('Interests:', margin, yPos)
      
      yPos += 7
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      const interestsText = itinerary.interests.map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(', ')
      const interestLines = doc.splitTextToSize(interestsText, pageWidth - 2 * margin)
      doc.text(interestLines, margin, yPos)
      yPos += interestLines.length * 5
    }

    // ========== BUDGET BREAKDOWN ==========
    if (itinerary.budgetBreakdown) {
      doc.addPage()
      yPos = 20
      
      // Section header
      addColoredBox(margin, yPos - 5, pageWidth - 2 * margin, 12, [59, 130, 246])
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(255, 255, 255)
      doc.text('Budget Breakdown', margin + 5, yPos + 3)
      
      yPos += 20
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)

      const breakdown = itinerary.budgetBreakdown
      const categories: Array<{ label: string; value: number; color: [number, number, number] }> = [
        { label: 'Flights/Rail/Car', value: breakdown.totalFlightCost, color: [239, 68, 68] },
        { label: 'Accommodation', value: breakdown.totalAccommodationCost, color: [59, 130, 246] },
        { label: 'Food', value: breakdown.totalFoodCost, color: [249, 115, 22] },
        { label: 'Sightseeing', value: breakdown.totalSightseeingCost, color: [34, 197, 94] },
        { label: 'Local Transport', value: breakdown.totalLocalTransportCost, color: [168, 85, 247] },
        { label: 'Shopping', value: breakdown.totalShoppingCost, color: [236, 72, 153] },
        { label: 'Miscellaneous', value: breakdown.totalMiscellaneousCost, color: [107, 114, 128] }
      ]

      categories.forEach((cat) => {
        if (cat.value > 0) {
          checkPageBreak(10)
          
          // Color bar
          const barWidth = 50
          addColoredBox(margin, yPos - 3, barWidth, 6, cat.color)
          
          doc.setFont('helvetica', 'normal')
          doc.text(cat.label, margin + barWidth + 5, yPos)
          
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(cat.color[0], cat.color[1], cat.color[2])
          doc.text(formatCost(cat.value), pageWidth - margin, yPos, { align: 'right' })
          doc.setTextColor(0, 0, 0)
          
          // Add room/night details for accommodation
          if (cat.label === 'Accommodation') {
            yPos += 6
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(8)
            doc.setTextColor(107, 114, 128)
            
            // Calculate rooms: typically 2 people per room, but adjust for solo travelers
            const rooms = itinerary.travelStyle === 'solo' ? 1 : Math.ceil(itinerary.totalPeople / 2)
            const nights = itinerary.duration
            
            doc.text(`(${rooms} room${rooms > 1 ? 's' : ''} × ${nights} night${nights > 1 ? 's' : ''})`, margin + barWidth + 5, yPos)
            doc.setTextColor(0, 0, 0)
            doc.setFontSize(10)
          }
          
          yPos += 10
        }
      })
    }

    // ========== DAILY COST BREAKDOWN ==========
    if (itinerary.dailyCostBreakdown && itinerary.dailyCostBreakdown.length > 0) {
      checkPageBreak(30)
      yPos += 10
      
      // Section header
      addColoredBox(margin, yPos - 5, pageWidth - 2 * margin, 12, [34, 197, 94])
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(255, 255, 255)
      doc.text('Daily Cost Breakdown', margin + 5, yPos + 3)
      
      yPos += 20
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)

      itinerary.dailyCostBreakdown.forEach((dayBreakdown) => {
        checkPageBreak(45)
        
        // Day header
        addColoredBox(margin, yPos - 3, pageWidth - 2 * margin, 8, [243, 244, 246])
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text(`Day ${dayBreakdown.day}`, margin + 3, yPos + 2)
        doc.setFontSize(9)
        doc.setTextColor(34, 197, 94)
        doc.text(`Total: ${formatCost(dayBreakdown.totalDayCost)}`, pageWidth - margin - 3, yPos + 2, { align: 'right' })
        doc.setTextColor(0, 0, 0)
        
        yPos += 12
        doc.setFont('helvetica', 'normal')
        
        const dayCosts = [
          { label: 'Flight/Rail/Car', value: dayBreakdown.flightCost },
          { label: 'Accommodation', value: dayBreakdown.accommodationCost },
          { label: 'Food', value: dayBreakdown.foodCost },
          { label: 'Sightseeing', value: dayBreakdown.sightseeingCost },
          { label: 'Local Transport', value: dayBreakdown.localTransportCost },
          { label: 'Shopping', value: dayBreakdown.shoppingCost },
          { label: 'Miscellaneous', value: dayBreakdown.miscellaneousCost }
        ]

        const col1X = margin + 5
        const col2X = pageWidth / 2 + 5
        let row = 0

        dayCosts.forEach((cost, idx) => {
          if (cost.value > 0) {
            const x = row % 2 === 0 ? col1X : col2X
            doc.text(`${cost.label}: ${formatCost(cost.value)}`, x, yPos)
            if (row % 2 === 1) yPos += 5
            row++
          }
        })
        
        if (row % 2 === 1) yPos += 5
        yPos += 5
      })
    }

    // ========== DAY BY DAY ITINERARY ==========
    doc.addPage()
    yPos = 20
    
    // Section header
    addColoredBox(0, 0, pageWidth, 15, [139, 92, 246]) // Purple
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(255, 255, 255)
    doc.text('Day-by-Day Itinerary', pageWidth / 2, 10, { align: 'center' })
    
    yPos = 25
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)

    itinerary.dayPlans.forEach((day) => {
      checkPageBreak(25)
      
      // Day header
      addColoredBox(margin, yPos, pageWidth - 2 * margin, 10, [139, 92, 246])
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(255, 255, 255)
      doc.text(`Day ${day.day}`, margin + 5, yPos + 7)
      
      if (day.date) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(255, 255, 255)
        doc.text(day.date, pageWidth - margin - 5, yPos + 7, { align: 'right' })
      }
      
      yPos += 15
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)

      const addActivities = (activities: Activity[], timeLabel: string, color: [number, number, number]) => {
        if (activities.length > 0) {
          checkPageBreak(15)
          
          // Time label
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(12)
          doc.setTextColor(color[0], color[1], color[2])
          doc.text(timeLabel, margin, yPos)
          yPos += 7
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(0, 0, 0)

          activities.forEach((activity) => {
            checkPageBreak(30)
            
            // Activity box
            const boxHeight = 25 + (activity.insiderTip ? 8 : 0)
            addColoredBox(margin, yPos - 2, pageWidth - 2 * margin, boxHeight, [249, 250, 251])
            
            // Activity title and cost
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(11)
            doc.setTextColor(0, 0, 0)
            doc.text(activity.title, margin + 3, yPos + 3)
            
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(34, 197, 94)
            doc.text(formatCost(activity.estimatedCost), pageWidth - margin - 3, yPos + 3, { align: 'right' })
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(0, 0, 0)
            
            yPos += 8
            
            // Time and duration
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            doc.setTextColor(107, 114, 128)
            doc.text(`${activity.time} | ${activity.duration}`, margin + 3, yPos)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(0, 0, 0)
            
            yPos += 5
            
            // Description
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            const descHeight = addWrappedText(activity.description, margin + 3, yPos, pageWidth - 2 * margin - 6, 4)
            yPos += descHeight
            
            // Insider tip
            if (activity.insiderTip) {
              yPos += 2
              doc.setFont('helvetica', 'bold')
              doc.setFontSize(8)
              doc.setTextColor(217, 119, 6)
              doc.text('Pro Tip:', margin + 3, yPos)
              doc.setFont('helvetica', 'normal')
              doc.setTextColor(217, 119, 6)
              const tipHeight = addWrappedText(activity.insiderTip, margin + 18, yPos, pageWidth - 2 * margin - 21, 4)
              yPos += tipHeight
              doc.setFont('helvetica', 'normal')
              doc.setTextColor(0, 0, 0)
            }
            
            yPos += 5
          })
          yPos += 3
        }
      }

      addActivities(day.morning, 'Morning', [251, 146, 60])
      addActivities(day.afternoon, 'Afternoon', [59, 130, 246])
      addActivities(day.evening, 'Evening', [139, 92, 246])
      
      // Add daily total from daily cost breakdown
      const dayBreakdown = itinerary.dailyCostBreakdown?.find(db => db.day === day.day)
      if (dayBreakdown) {
        checkPageBreak(15)
        yPos += 5
        
        // Daily total box
        addColoredBox(margin, yPos - 2, pageWidth - 2 * margin, 10, [240, 253, 244])
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(34, 197, 94)
        doc.text('Daily Total Cost:', margin + 3, yPos + 5)
        doc.text(formatCost(dayBreakdown.totalDayCost), pageWidth - margin - 3, yPos + 5, { align: 'right' })
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
        
        yPos += 15
      } else {
        yPos += 5
      }
    })

    // ========== ACCOMMODATION SUGGESTIONS ==========
    if (itinerary.accommodationSuggestions && itinerary.accommodationSuggestions.length > 0) {
      doc.addPage()
      yPos = 20
      
      // Section header
      addColoredBox(margin, yPos - 5, pageWidth - 2 * margin, 12, [236, 72, 153])
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(255, 255, 255)
      doc.text('Accommodation Suggestions', margin + 5, yPos + 3)
      
      yPos += 20
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)

      itinerary.accommodationSuggestions.forEach((acc) => {
        checkPageBreak(35)
        
        addColoredBox(margin, yPos - 2, pageWidth - 2 * margin, 30, [252, 231, 243])
        
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text(acc.name, margin + 3, yPos + 3)
        
        yPos += 8
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(0, 0, 0)
        doc.text(`Type: ${acc.type} | Price: ${acc.priceRange}`, margin + 3, yPos)
        
        yPos += 5
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(107, 114, 128)
        const locText = typeof acc.location === 'string' ? acc.location : acc.location.address
        const locHeight = addWrappedText(`Location: ${locText}`, margin + 3, yPos, pageWidth - 2 * margin - 6, 4)
        yPos += locHeight
        
        if (acc.amenities && acc.amenities.length > 0) {
          yPos += 2
          const amenitiesText = 'Amenities: ' + acc.amenities.join(', ')
          const amenHeight = addWrappedText(amenitiesText, margin + 3, yPos, pageWidth - 2 * margin - 6, 4)
          yPos += amenHeight
        }
        
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
        yPos += 8
      })
    }

    // ========== RESTAURANT RECOMMENDATIONS ==========
    if (itinerary.restaurantRecommendations && itinerary.restaurantRecommendations.length > 0) {
      checkPageBreak(40)
      yPos += 10
      
      // Section header
      addColoredBox(margin, yPos - 5, pageWidth - 2 * margin, 12, [249, 115, 22])
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(255, 255, 255)
      doc.text('Restaurant Recommendations', margin + 5, yPos + 3)
      
      yPos += 20
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)

      itinerary.restaurantRecommendations.forEach((rest) => {
        checkPageBreak(30)
        
        addColoredBox(margin, yPos - 2, pageWidth - 2 * margin, 25, [254, 243, 199])
        
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(0, 0, 0)
        doc.text(rest.name, margin + 3, yPos + 3)
        
        yPos += 7
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(0, 0, 0)
        doc.text(`Cuisine: ${rest.cuisine} | Price: ${rest.priceRange}`, margin + 3, yPos)
        
        yPos += 5
        if (rest.mustTryDish) {
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(249, 115, 22)
          doc.text('Must Try:', margin + 3, yPos)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(0, 0, 0)
          doc.text(rest.mustTryDish, margin + 20, yPos)
          yPos += 5
        }
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(107, 114, 128)
        const restLocText = typeof rest.location === 'string' ? rest.location : rest.location.address
        const restLocHeight = addWrappedText(`Location: ${restLocText}`, margin + 3, yPos, pageWidth - 2 * margin - 6, 4)
        yPos += restLocHeight
        
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
        yPos += 8
      })
    }

    // ========== GENERAL TIPS ==========
    if (itinerary.generalTips && itinerary.generalTips.length > 0) {
      doc.addPage()
      yPos = 20
      
      // Section header
      addColoredBox(margin, yPos - 5, pageWidth - 2 * margin, 12, [34, 197, 94])
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Travel Tips & Suggestions', margin + 5, yPos + 3)
      
      yPos += 20
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')

      itinerary.generalTips.forEach((tip, index) => {
        checkPageBreak(15)
        
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(34, 197, 94)
        doc.text(`${index + 1}.`, margin, yPos)
        
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
        const tipHeight = addWrappedText(tip, margin + 7, yPos, pageWidth - 2 * margin - 7, 5)
        yPos += tipHeight + 3
      })
    }

    // ========== PACKING LIST ==========
    if (itinerary.packingList && itinerary.packingList.length > 0) {
      checkPageBreak(40)
      yPos += 10
      
      // Section header
      addColoredBox(margin, yPos - 5, pageWidth - 2 * margin, 12, [168, 85, 247])
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(255, 255, 255)
      doc.text('Packing List', margin + 5, yPos + 3)
      
      yPos += 20
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)

      const col1Items = itinerary.packingList.filter((_, i) => i % 2 === 0)
      const col2Items = itinerary.packingList.filter((_, i) => i % 2 === 1)
      
      const maxItems = Math.max(col1Items.length, col2Items.length)
      
      for (let i = 0; i < maxItems; i++) {
        checkPageBreak(7)
        
        if (col1Items[i]) {
          doc.text(`☑ ${col1Items[i]}`, margin + 3, yPos)
        }
        if (col2Items[i]) {
          doc.text(`☑ ${col2Items[i]}`, pageWidth / 2 + 3, yPos)
        }
        yPos += 6
      }
    }

    // ========== FOOTER ON LAST PAGE ==========
    yPos = pageHeight - 15
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text('Generated by Travel Blog - Have a wonderful trip!', pageWidth / 2, yPos, { align: 'center' })

    doc.save(`${itinerary.title.replace(/\s+/g, '_')}.pdf`)
    setShowExport(false)
  }

  const copyShareLink = () => {
    if (itinerary.shareToken) {
      const shareUrl = `${window.location.origin}/itinerary/share/${itinerary.shareToken}`
      navigator.clipboard.writeText(shareUrl)
      alert('Share link copied to clipboard!')
    }
    if (onShare) onShare()
  }

  const handleEmailItinerary = async () => {
    if (!recipientEmail) {
      setEmailError('Please enter a valid email address')
      return
    }

    setEmailSending(true)
    setEmailError('')

    try {
      const result = await emailItinerary(itinerary._id, { to: recipientEmail })
      
      if (result.success) {
        alert('Itinerary sent successfully!')
        setShowEmailModal(false)
        setRecipientEmail('')
      } else {
        setEmailError(result.message || 'Failed to send email')
      }
    } catch (error: any) {
      setEmailError(error.message || 'Failed to send email')
    } finally {
      setEmailSending(false)
    }
  }

  const currentDay = itinerary.dayPlans.find(d => d.day === activeDay)
  
  const travelModeIcons: Record<string, { icon: string; label: string }> = {
    air: { icon: '✈️', label: 'Flight' },
    rail: { icon: '🚆', label: 'Train' },
    car: { icon: '🚗', label: 'Road Trip' },
    bus: { icon: '🚌', label: 'Bus' },
    mixed: { icon: '🔄', label: 'Mixed' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative h-48 sm:h-56 md:h-64 bg-gradient-to-br from-blue-500 to-purple-600">
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="text-white text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-4">{itinerary.title}</h1>
              <p className="text-base sm:text-lg md:text-2xl opacity-90 mb-1 md:mb-2">
                {itinerary.source} → {itinerary.destinations && itinerary.destinations.length > 0
                  ? itinerary.destinations.length === 1
                    ? itinerary.destinations[0]
                    : itinerary.destinations.join(', ')
                  : 'Multiple Destinations'}
              </p>
              <p className="text-sm sm:text-base md:text-lg opacity-80 flex items-center justify-center gap-2">
                <span>{travelModeIcons[itinerary.travelMode]?.icon}</span>
                <span>{travelModeIcons[itinerary.travelMode]?.label}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Meta Info */}
        <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 border-b">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">From</p>
            <p className="text-sm sm:text-base md:text-lg font-semibold truncate">{itinerary.source}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">To</p>
            <p className="text-sm sm:text-base md:text-lg font-semibold truncate">
              {itinerary.destinations && itinerary.destinations.length > 0
                ? itinerary.destinations.length === 1
                  ? itinerary.destinations[0]
                  : `${itinerary.destinations[0]} +${itinerary.destinations.length - 1}`
                : 'Multiple Destinations'}
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Duration</p>
            <p className="text-sm sm:text-base md:text-lg font-semibold">{itinerary.duration} days</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Budget</p>
            <p className="text-sm sm:text-base md:text-lg font-semibold capitalize">{itinerary.budget}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Travel Style</p>
            <p className="text-sm sm:text-base md:text-lg font-semibold capitalize">{itinerary.travelStyle}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Total Cost</p>
            <p className="text-sm sm:text-base md:text-lg font-semibold text-blue-600">
              {formatCost(itinerary.totalEstimatedCost)}
            </p>
            {itinerary.currency && itinerary.currency !== 'USD' && (
              <p className="text-xs text-gray-500">({itinerary.currency})</p>
            )}
          </div>
        </div>

        {/* Interests */}
        <div className="p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-gray-600 mb-2">Interests</p>
          <div className="flex flex-wrap gap-2">
            {itinerary.interests.map(interest => (
              <span
                key={interest}
                className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium capitalize"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-6 bg-gray-50 flex flex-wrap gap-2 sm:gap-3">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ✏️ Edit
            </button>
          )}
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Regenerate
            </button>
          )}
          <button
            onClick={() => setShowExport(true)}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📥 Export PDF
          </button>
          <button
            onClick={() => setShowEmailModal(true)}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            � Email
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full sm:w-auto sm:ml-auto"
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>

      {/* Weather Widget */}
      <WeatherWidget weatherForecast={itinerary.weatherForecast || null} />

      {/* Day Selector */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Daily Itinerary</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {itinerary.dayPlans.map(day => (
            <button
              key={day.day}
              onClick={() => setActiveDay(day.day)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold whitespace-nowrap transition-colors text-sm sm:text-base ${
                activeDay === day.day
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Day {day.day}
            </button>
          ))}
        </div>
      </div>

      {/* Day Activities */}
      {currentDay && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-bold">Day {currentDay.day}</h3>
            <p className="text-base sm:text-lg font-semibold text-blue-600">
              {formatCost(itinerary.dailyCostBreakdown?.find(db => db.day === currentDay.day)?.totalDayCost || currentDay.totalEstimatedCost)}
            </p>
          </div>

          {/* Morning */}
          {currentDay.morning.length > 0 && (
            <ActivitySection title="Morning ☀️" activities={currentDay.morning} currencySymbol={itinerary.currencySymbol} />
          )}

          {/* Afternoon */}
          {currentDay.afternoon.length > 0 && (
            <ActivitySection title="Afternoon 🌤️" activities={currentDay.afternoon} currencySymbol={itinerary.currencySymbol} />
          )}

          {/* Evening */}
          {currentDay.evening.length > 0 && (
            <ActivitySection title="Evening 🌙" activities={currentDay.evening} currencySymbol={itinerary.currencySymbol} />
          )}

          {/* Notes */}
          {currentDay.notes && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-sm text-yellow-800">
                <strong>💡 Tip:</strong> {currentDay.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Accommodations */}
      {itinerary.accommodationSuggestions && itinerary.accommodationSuggestions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">🏨 Accommodation Suggestions</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {itinerary.accommodationSuggestions.map((acc, index) => {
              // Handle case where acc might be a string or malformed
              if (typeof acc === 'string') {
                return (
                  <div key={index} className="border rounded-lg p-3 sm:p-4 hover:shadow-lg transition-shadow">
                    <p className="text-sm text-gray-700">{acc}</p>
                  </div>
                )
              }
              
              // Ensure amenities is an array
              const amenities = Array.isArray(acc.amenities) 
                ? acc.amenities 
                : (typeof acc.amenities === 'string' ? [acc.amenities] : [])
              
              return (
                <div key={index} className="border rounded-lg p-3 sm:p-4 hover:shadow-lg transition-shadow">
                  <h4 className="font-semibold text-base sm:text-lg">{acc.name || 'Accommodation'}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{acc.type || 'Hotel'}</p>
                  <p className="text-blue-600 font-medium mt-1 text-sm sm:text-base">{acc.priceRange || 'Contact for pricing'}</p>
                  {acc.location && acc.location.address && (
                    <div className="mt-2 flex items-start gap-2">
                      <p className="text-xs sm:text-sm text-gray-700 flex-1">📍 {acc.location.address}</p>
                      {acc.location.coordinates && acc.location.coordinates.lat && acc.location.coordinates.lng && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${acc.location.coordinates.lat},${acc.location.coordinates.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition whitespace-nowrap"
                        >
                          🧭 Directions
                        </a>
                      )}
                    </div>
                  )}
                  
                  {/* Enhanced: Proximity to attractions */}
                  {acc.proximityToAttractions && (
                    <p className="text-xs text-gray-600 mt-1">🗺️ {acc.proximityToAttractions}</p>
                  )}
                  
                  {/* Enhanced: Why recommended */}
                  {acc.whyRecommended && (
                    <p className="text-xs text-green-700 bg-green-50 p-2 rounded mt-2">
                      ✓ {acc.whyRecommended}
                    </p>
                  )}
                  
                  {/* Enhanced: Booking tip */}
                  {acc.bookingTip && (
                    <p className="text-xs text-orange-700 bg-orange-50 p-2 rounded mt-2">
                      💡 {acc.bookingTip}
                    </p>
                  )}
                  
                  {/* Amenities */}
                  {amenities.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {amenities.map((amenity, i) => (
                        <span
                          key={i}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                        >
                          {String(amenity)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Transportation */}
      {itinerary.transportationTips && itinerary.transportationTips.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">🚗 Transportation Tips</h3>
          <div className="space-y-3">
            {itinerary.transportationTips.map((tip, index) => {
              // Handle case where tip might be a string or malformed
              if (typeof tip === 'string') {
                return (
                  <div key={index} className="border-l-4 border-blue-400 pl-3 sm:pl-4 py-2">
                    <p className="text-sm text-gray-700">{tip}</p>
                  </div>
                )
              }
              
              return (
                <div key={index} className="border-l-4 border-blue-400 pl-3 sm:pl-4 py-2">
                  <h4 className="font-semibold text-sm sm:text-base">{tip.type || 'Transportation'}</h4>
                  {tip.description && (
                    <p className="text-gray-700 text-xs sm:text-sm mt-1">{tip.description}</p>
                  )}
                  {tip.estimatedCost !== undefined && tip.estimatedCost > 0 && (
                    <p className="text-blue-600 font-medium mt-1 text-sm sm:text-base">
                      {formatCost(tip.estimatedCost)}
                    </p>
                  )}
                  {/* Enhanced: Insider tip */}
                  {tip.insiderTip && (
                    <p className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded mt-2">
                      💡 {tip.insiderTip}
                    </p>
                  )}
                  {/* Enhanced: Booking info */}
                  {tip.bookingInfo && (
                    <p className="text-xs text-purple-700 bg-purple-50 p-2 rounded mt-2">
                      📱 {tip.bookingInfo}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Restaurants */}
      {itinerary.restaurantRecommendations && itinerary.restaurantRecommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">🍽️ Restaurant Recommendations</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {itinerary.restaurantRecommendations.map((restaurant, index) => {
              // Handle case where restaurant might be a string or malformed
              if (typeof restaurant === 'string') {
                return (
                  <div key={index} className="border rounded-lg p-3 sm:p-4">
                    <p className="text-sm text-gray-700">{restaurant}</p>
                  </div>
                )
              }
              
              // Ensure mealType is an array
              const mealTypes = Array.isArray(restaurant.mealType)
                ? restaurant.mealType
                : (typeof restaurant.mealType === 'string' ? [restaurant.mealType] : [])
              
              return (
                <div key={index} className="border rounded-lg p-3 sm:p-4 hover:shadow-lg transition-shadow">
                  <h4 className="font-semibold text-base sm:text-lg">{restaurant.name || 'Restaurant'}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{restaurant.cuisine || 'Various'}</p>
                  {restaurant.priceRange && (
                    <p className="text-blue-600 font-medium mt-1 text-sm sm:text-base">
                      {restaurant.priceRange}
                    </p>
                  )}
                  {restaurant.location && restaurant.location.address && (
                    <div className="mt-2 flex items-start gap-2">
                      <p className="text-xs sm:text-sm text-gray-700 flex-1">📍 {restaurant.location.address}</p>
                      {restaurant.location.coordinates && restaurant.location.coordinates.lat && restaurant.location.coordinates.lng && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${restaurant.location.coordinates.lat},${restaurant.location.coordinates.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition whitespace-nowrap"
                        >
                          🧭 Directions
                        </a>
                      )}
                    </div>
                  )}
                  
                  {/* Enhanced: Must-try dish */}
                  {restaurant.mustTryDish && (
                    <p className="text-xs text-green-700 bg-green-50 p-2 rounded mt-2">
                      ⭐ Must Try: {restaurant.mustTryDish}
                    </p>
                  )}
                  
                  {/* Enhanced: Reservation info */}
                  {restaurant.reservationNeeded && (
                    <p className="text-xs text-orange-700 bg-orange-50 p-2 rounded mt-2">
                      📞 Reservation Recommended
                    </p>
                  )}
                  
                  {/* Enhanced: Local favorite badge */}
                  {restaurant.localFavorite && (
                    <span className="inline-block mt-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      ❤️ Local Favorite
                    </span>
                  )}
                  
                  {/* Meal types */}
                  {mealTypes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {mealTypes.map((meal, i) => (
                        <span
                          key={i}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded capitalize"
                        >
                          {String(meal)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* General Tips */}
      {itinerary.generalTips && itinerary.generalTips.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">💡 General Tips & Insider Knowledge</h3>
          <ul className="space-y-2">
            {itinerary.generalTips.map((tip, index) => (
              <li key={index} className="flex gap-2 sm:gap-3">
                <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                <span className="text-sm sm:text-base text-gray-700">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Enhanced: Packing List */}
      {itinerary.packingList && itinerary.packingList.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">🎒 Packing List (Season-Specific)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {itinerary.packingList.map((item, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 sm:p-3 rounded-lg">
                <span className="text-green-600 flex-shrink-0">✓</span>
                <span className="text-sm sm:text-base text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced: Daily Cost Breakdown */}
      {itinerary.dailyCostBreakdown && itinerary.dailyCostBreakdown.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">📊 Daily Cost Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Day</th>
                  <th className="p-2 text-right">Flight/Rail</th>
                  <th className="p-2 text-right">Hotel</th>
                  <th className="p-2 text-right">Food</th>
                  <th className="p-2 text-right">Sightseeing</th>
                  <th className="p-2 text-right">Transport</th>
                  <th className="p-2 text-right">Shopping</th>
                  <th className="p-2 text-right">Misc</th>
                  <th className="p-2 text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {itinerary.dailyCostBreakdown.map((day, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">Day {day.day}</td>
                    <td className="p-2 text-right">{formatCost(day.flightCost || 0)}</td>
                    <td className="p-2 text-right">{formatCost(day.accommodationCost || 0)}</td>
                    <td className="p-2 text-right">{formatCost(day.foodCost || 0)}</td>
                    <td className="p-2 text-right">{formatCost(day.sightseeingCost || 0)}</td>
                    <td className="p-2 text-right">{formatCost(day.localTransportCost || 0)}</td>
                    <td className="p-2 text-right">{formatCost(day.shoppingCost || 0)}</td>
                    <td className="p-2 text-right">{formatCost(day.miscellaneousCost || 0)}</td>
                    <td className="p-2 text-right font-bold text-blue-600">{formatCost(day.totalDayCost || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enhanced: Budget Breakdown Summary */}
      {itinerary.budgetBreakdown && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">💰 Budget Breakdown Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm sm:text-base text-gray-700">✈️ Total Flight/Rail/Car Cost</span>
              <span className="font-semibold text-sm sm:text-base text-blue-600">{formatCost(itinerary.budgetBreakdown.totalFlightCost || 0)}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex flex-col">
                <span className="text-sm sm:text-base text-gray-700">🏨 Total Accommodation Cost</span>
                <span className="text-xs text-gray-500">
                  ({itinerary.travelStyle === 'solo' ? 1 : Math.ceil(itinerary.totalPeople / 2)} room{itinerary.travelStyle === 'solo' ? '' : Math.ceil(itinerary.totalPeople / 2) > 1 ? 's' : ''} × {itinerary.duration} night{itinerary.duration > 1 ? 's' : ''})
                </span>
              </div>
              <span className="font-semibold text-sm sm:text-base text-blue-600">{formatCost(itinerary.budgetBreakdown.totalAccommodationCost || 0)}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm sm:text-base text-gray-700">🍽️ Total Food Cost</span>
              <span className="font-semibold text-sm sm:text-base text-blue-600">{formatCost(itinerary.budgetBreakdown.totalFoodCost || 0)}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm sm:text-base text-gray-700">🎡 Total Sightseeing Cost</span>
              <span className="font-semibold text-sm sm:text-base text-blue-600">{formatCost(itinerary.budgetBreakdown.totalSightseeingCost || 0)}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm sm:text-base text-gray-700">🚖 Total Local Transport Cost</span>
              <span className="font-semibold text-sm sm:text-base text-blue-600">{formatCost(itinerary.budgetBreakdown.totalLocalTransportCost || 0)}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm sm:text-base text-gray-700">🛍️ Total Shopping Cost</span>
              <span className="font-semibold text-sm sm:text-base text-blue-600">{formatCost(itinerary.budgetBreakdown.totalShoppingCost || 0)}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm sm:text-base text-gray-700">💳 Total Miscellaneous Cost</span>
              <span className="font-semibold text-sm sm:text-base text-blue-600">{formatCost(itinerary.budgetBreakdown.totalMiscellaneousCost || 0)}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 border-t-2 border-gray-300 gap-1">
              <span className="font-bold text-base sm:text-lg">Grand Total</span>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-base sm:text-lg text-blue-600">{formatCost(itinerary.totalEstimatedCost)}</span>
                {itinerary.currency && (
                  <span className="text-xs sm:text-sm text-gray-500">({itinerary.currency})</span>
                )}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs sm:text-sm text-gray-500 italic">
                * Disclaimer: All costs are estimates and may vary based on season, availability, and exchange rates. Please verify actual prices before booking.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Export Itinerary</h3>
            <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
              Download your itinerary as a PDF file to access it offline.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={exportToPDF}
                className="flex-1 px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Download PDF
              </button>
              <button
                onClick={() => setShowExport(false)}
                className="px-4 py-2 text-sm sm:text-base bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Email Itinerary</h3>
            <p className="text-sm sm:text-base text-gray-700 mb-4">
              Enter the email address where you'd like to send this itinerary. The itinerary will be sent as a PDF attachment.
            </p>
            
            <div className="mb-4">
              <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                id="recipientEmail"
                value={recipientEmail}
                onChange={(e) => {
                  setRecipientEmail(e.target.value)
                  setEmailError('')
                }}
                placeholder="example@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={emailSending}
              />
              {emailError && (
                <p className="mt-2 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleEmailItinerary}
                disabled={emailSending || !recipientEmail}
                className="flex-1 px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {emailSending ? 'Sending...' : '📧 Send Email'}
              </button>
              <button
                onClick={() => {
                  setShowEmailModal(false)
                  setRecipientEmail('')
                  setEmailError('')
                }}
                disabled={emailSending}
                className="px-4 py-2 text-sm sm:text-base bg-gray-200 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ActivitySection({
  title,
  activities,
  currencySymbol = '$'
}: {
  title: string
  activities: Activity[]
  currencySymbol?: string
}) {
  const formatCost = (cost: any): string => {
    if (typeof cost === 'string') {
      return cost
    }
    return `${currencySymbol}${typeof cost === 'number' ? cost.toLocaleString() : cost}`
  }

  return (
    <div>
      <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800">{title}</h4>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-blue-400">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
              <div className="flex-1">
                <h5 className="font-semibold text-sm sm:text-base text-gray-900">{activity.title}</h5>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{activity.time}</p>
                {activity.bookingRequired && (
                  <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    📅 Booking Required
                  </span>
                )}
              </div>
              <span className="text-blue-600 font-semibold text-sm sm:text-base whitespace-nowrap">
                {formatCost(activity.estimatedCost)}
              </span>
            </div>
            <p className="text-gray-700 text-xs sm:text-sm mb-2">{activity.description}</p>
            
            {/* Enhanced: Insider Tip */}
            {activity.insiderTip && (
              <div className="bg-yellow-50 border-l-2 border-yellow-400 pl-2 sm:pl-3 py-2 my-2">
                <p className="text-xs text-yellow-800">
                  <strong>💡 Pro Tip:</strong> {activity.insiderTip}
                </p>
              </div>
            )}
            
            <div className="flex gap-3 sm:gap-4 text-xs text-gray-600 flex-wrap">
              <span className="flex items-center gap-1">⏱️ {activity.duration}</span>
              {activity.location && <span className="flex items-center gap-1">📍 {activity.location}</span>}
              {activity.bestTimeToVisit && <span className="flex items-center gap-1">🕒 {activity.bestTimeToVisit}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
