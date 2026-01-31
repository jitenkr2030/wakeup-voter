import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const localVsNational = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    
    if (category) where.category = category
    if (status) where.status = status
    if (priority) where.priority = priority
    if (localVsNational) where.localVsNational = localVsNational

    const issues = await db.issue.findMany({
      where,
      orderBy: [
        { impactScore: 'desc' },
        { lastUpdated: 'desc' }
      ],
      include: {
        timeline: {
          orderBy: { date: 'desc' },
          take: 3
        },
        _count: {
          select: {
            discussions: true,
            reports: true
          }
        }
      },
      take: limit,
      skip: offset
    })

    const total = await db.issue.count({ where })

    return NextResponse.json({
      success: true,
      data: issues,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching issues:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch issues' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      title,
      summary,
      description,
      category,
      subcategory,
      localVsNational = 'national',
      state,
      city,
      area,
      sourceUrl,
      sourceTitle,
      tags = '',
      expectedResolution
    } = body

    if (!title || !summary || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate impact score based on various factors
    let impactScore = 50 // Base score
    
    // Category-based scoring
    const categoryScores: Record<string, number> = {
      'health': 85,
      'education': 80,
      'infrastructure': 75,
      'economy': 90,
      'environment': 70
    }
    impactScore = categoryScores[category] || 50

    // Local vs National adjustment
    if (localVsNational === 'national') {
      impactScore += 10
    }

    // Determine priority based on impact score
    let priority = 'medium'
    if (impactScore >= 80) priority = 'high'
    else if (impactScore >= 60) priority = 'medium'
    else priority = 'low'

    const issue = await db.issue.create({
      data: {
        title,
        summary,
        description,
        category,
        subcategory,
        impactScore,
        localVsNational,
        state,
        city,
        area,
        sourceUrl,
        sourceTitle,
        tags,
        expectedResolution: expectedResolution ? new Date(expectedResolution) : null,
        priority,
        status: 'active',
        isVerified: false
      },
      include: {
        timeline: true
      }
    })

    // Create initial timeline entry
    await db.issueTimeline.create({
      data: {
        issueId: issue.id,
        eventType: 'reported',
        description: 'मुद्दा दर्ज किया गया',
        source: 'system'
      }
    })

    return NextResponse.json({
      success: true,
      data: issue
    })
  } catch (error) {
    console.error('Error creating issue:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create issue' },
      { status: 500 }
    )
  }
}