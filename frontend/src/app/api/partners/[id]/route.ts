import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// GET /api/partners/[id] - Get partner by ID
export async function GET(
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

    const backendUrl = `${API_BASE_URL}/partners/${partnerId}`

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Partners API GET by ID error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partner' },
      { status: 500 }
    )
  }
}

// DELETE /api/partners/[id] - Delete partner
export async function DELETE(
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

    const backendUrl = `${API_BASE_URL}/partners/${partnerId}`

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Partner deleted successfully' }
    })
  } catch (error) {
    console.error('Partners API DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete partner' },
      { status: 500 }
    )
  }
}
