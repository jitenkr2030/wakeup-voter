import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')
    const city = searchParams.get('city')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    
    if (state) where.state = state
    if (city) where.city = city
    if (category) where.category = category
    if (status) where.status = status

    const reports = await db.localReport.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true
          }
        },
        issue: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' },
        { upvotes: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    const total = await db.localReport.count({ where })

    return NextResponse.json({
      success: true,
      data: reports,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      userId,
      title,
      description,
      category,
      state,
      city,
      area,
      latitude,
      longitude,
      imageUrl,
      isAnonymous = false
    } = body

    if (!userId || !title || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const report = await db.localReport.create({
      data: {
        userId,
        title,
        description,
        category,
        state,
        city,
        area,
        latitude,
        longitude,
        imageUrl,
        isAnonymous,
        status: 'pending'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true
          }
        }
      }
    })

    // Try to match with existing issues
    const matchingIssues = await db.issue.findMany({
      where: {
        OR: [
          { title: { contains: title, mode: 'insensitive' } },
          { category: category },
          { state: state },
          { city: city }
        ]
      }
    })

    // If found matching issues, link to the most relevant one
    if (matchingIssues.length > 0) {
      const mostRelevant = matchingIssues[0]
      await db.localReport.update({
        where: { id: report.id },
        data: { issueId: mostRelevant.id }
      })

      // Add timeline entry to the issue
      await db.issueTimeline.create({
        data: {
          issueId: mostRelevant.id,
          eventType: 'updated',
          description: `नई स्थानीय रिपोर्ट: ${title}`,
          source: 'citizen_report'
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: report
    })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    )
  }
}