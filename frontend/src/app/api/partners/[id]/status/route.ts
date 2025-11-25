import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// PUT /api/partners/[id]/status - Update partner status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partnerId = params.id

    if (!partnerId) {
      return NextResponse.json(
        { success: false, error: 'Partner ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Valid status is required' },
        { status: 400 }
      )
    }

    const backendUrl = `${API_BASE_URL}/partners/${partnerId}/status`

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data: data.partner
    })
  } catch (error) {
    console.error('Partners API PUT status error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update partner status' },
      { status: 500 }
    )
  }
}
