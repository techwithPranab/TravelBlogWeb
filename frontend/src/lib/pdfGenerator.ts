import jsPDF from 'jspdf'

interface Guide {
  id: string
  title: string
  description: string
  type: string
  destination: {
    name: string
    country: string
  }
  author: {
    name: string
    avatar: string
    bio: string
  }
  featuredImage?: {
    url: string
    alt: string
  }
  duration: string | { days: number; description: string }
  difficulty: string
  budget: {
    range: string
    details: string
  }
  bestTime: string
  rating: number
  totalReviews: number
  publishedAt: string
  lastUpdated: string
  sections: Array<{
    title: string
    content: string
    tips?: string[]
    images?: Array<{
      url: string
      alt: string
      caption?: string
    }>
  }>
  itinerary?: Array<{
    day: number
    title: string
    activities: string[]
    meals: string[]
    accommodation: string
    budget: string
  }>
  packingList?: Array<{
    category: string
    items: string[]
  }>
  resources: Array<{
    title: string
    type: string
    url: string
  }>
}

export const generateGuidePDF = async (guide: Guide): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  let yPosition = margin

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
    pdf.setFontSize(fontSize)
    const lines = pdf.splitTextToSize(text, maxWidth)
    pdf.text(lines, x, y)
    return y + (lines.length * fontSize * 0.4)
  }

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  try {
    // Title
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    yPosition = addWrappedText(guide.title, margin, yPosition, pageWidth - 2 * margin, 24)
    yPosition += 10

    // Description
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'normal')
    yPosition = addWrappedText(guide.description, margin, yPosition, pageWidth - 2 * margin, 14)
    yPosition += 15

    // Guide Details
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Guide Details', margin, yPosition)
    yPosition += 10

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')

    // Format duration
    const formatDuration = (duration: string | { days: number; description: string }) => {
      if (typeof duration === 'string') {
        return duration
      }
      if (typeof duration === 'object' && duration.days) {
        return duration.description || `${duration.days} days`
      }
      return 'N/A'
    }

    const details = [
      `Destination: ${guide.destination?.name || 'N/A'}, ${guide.destination?.country || ''}`,
      `Duration: ${formatDuration(guide.duration)}`,
      `Difficulty: ${guide.difficulty}`,
      `Budget: ${guide.budget?.range || 'N/A'}`,
      `Best Time: ${guide.bestTime}`,
      `Rating: ${guide.rating}/5 (${guide.totalReviews || 0} reviews)`,
      `Author: ${guide.author?.name || 'Unknown'}`,
      `Last Updated: ${new Date(guide.lastUpdated).toLocaleDateString()}`
    ]

    details.forEach(detail => {
      checkNewPage(8)
      pdf.text(detail, margin, yPosition)
      yPosition += 8
    })

    yPosition += 10

    // Guide Sections
    if (guide.sections && guide.sections.length > 0) {
      checkNewPage(20)
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Guide Overview', margin, yPosition)
      yPosition += 15

      guide.sections.forEach((section, index) => {
        checkNewPage(30)

        // Section title
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        yPosition = addWrappedText(`${index + 1}. ${section.title}`, margin, yPosition, pageWidth - 2 * margin, 16)
        yPosition += 8

        // Section content
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        yPosition = addWrappedText(section.content, margin, yPosition, pageWidth - 2 * margin, 12)
        yPosition += 10

        // Section tips
        if (section.tips && section.tips.length > 0) {
          checkNewPage(20)
          pdf.setFontSize(14)
          pdf.setFont('helvetica', 'bold')
          pdf.text('💡 Pro Tips:', margin, yPosition)
          yPosition += 8

          pdf.setFontSize(12)
          pdf.setFont('helvetica', 'normal')
          section.tips.forEach(tip => {
            checkNewPage(8)
            pdf.text(`• ${tip}`, margin + 5, yPosition)
            yPosition += 8
          })
          yPosition += 5
        }
      })
    }

    // Itinerary
    if (guide.itinerary && guide.itinerary.length > 0) {
      checkNewPage(20)
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Day-by-Day Itinerary', margin, yPosition)
      yPosition += 15

      guide.itinerary.forEach((day) => {
        checkNewPage(40)

        // Day title
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`Day ${day.day}: ${day.title}`, margin, yPosition)
        yPosition += 10

        // Activities
        if (day.activities && day.activities.length > 0) {
          pdf.setFontSize(14)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Activities:', margin, yPosition)
          yPosition += 8

          pdf.setFontSize(12)
          pdf.setFont('helvetica', 'normal')
          day.activities.forEach(activity => {
            checkNewPage(8)
            pdf.text(`• ${activity}`, margin + 5, yPosition)
            yPosition += 8
          })
          yPosition += 5
        }

        // Meals
        if (day.meals && day.meals.length > 0) {
          checkNewPage(15)
          pdf.setFontSize(14)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Meals:', margin, yPosition)
          yPosition += 8

          pdf.setFontSize(12)
          pdf.setFont('helvetica', 'normal')
          day.meals.forEach(meal => {
            checkNewPage(8)
            pdf.text(`• ${meal}`, margin + 5, yPosition)
            yPosition += 8
          })
          yPosition += 5
        }

        // Accommodation
        if (day.accommodation) {
          checkNewPage(15)
          pdf.setFontSize(14)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Accommodation:', margin, yPosition)
          yPosition += 8

          pdf.setFontSize(12)
          pdf.setFont('helvetica', 'normal')
          yPosition = addWrappedText(day.accommodation, margin + 5, yPosition, pageWidth - 2 * margin - 5, 12)
          yPosition += 5
        }

        // Budget
        if (day.budget) {
          checkNewPage(10)
          pdf.setFontSize(12)
          pdf.setFont('helvetica', 'italic')
          pdf.text(`Budget: ${day.budget}`, margin, yPosition)
          yPosition += 15
        }
      })
    }

    // Packing List
    if (guide.packingList && guide.packingList.length > 0) {
      checkNewPage(20)
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Packing List', margin, yPosition)
      yPosition += 15

      guide.packingList.forEach((category) => {
        checkNewPage(20)

        // Category title
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text(category.category, margin, yPosition)
        yPosition += 10

        // Items
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        category.items.forEach(item => {
          checkNewPage(8)
          pdf.text(`• ${item}`, margin + 5, yPosition)
          yPosition += 8
        })
        yPosition += 5
      })
    }

    // Resources
    if (guide.resources && guide.resources.length > 0) {
      checkNewPage(20)
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Useful Resources', margin, yPosition)
      yPosition += 15

      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      guide.resources.forEach((resource) => {
        checkNewPage(8)
        pdf.text(`${resource.title}: ${resource.url}`, margin, yPosition)
        yPosition += 8
      })
    }

    // Footer
    const totalPages = pdf.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(
        `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
    }

    // Save the PDF
    const fileName = `${guide.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_guide.pdf`
    pdf.save(fileName)

  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF. Please try again.')
  }
}
