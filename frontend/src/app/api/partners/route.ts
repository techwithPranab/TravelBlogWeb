import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// GET /api/partners - Get all partners
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    // Build query string for backend
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(status !== 'all' && { status })
    })

    const backendUrl = `${API_BASE_URL}/partners?${queryParams.toString()}`

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

    // Transform backend response to match frontend API expectations
    return NextResponse.json({
      success: true,
      data: {
        partners: data.partners || [],
        totalPages: data.pagination?.totalPages || 1,
        currentPage: data.pagination?.currentPage || 1,
        total: data.pagination?.totalPartners || 0
      }
    })
  } catch (error) {
    console.error('Partners API GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partners' },
      { status: 500 }
    )
  }
}