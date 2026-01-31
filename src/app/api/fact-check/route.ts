import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const issueId = searchParams.get('issueId')
    const isMisleading = searchParams.get('isMisleading')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    
    if (issueId) where.issueId = issueId
    if (isMisleading !== null) where.isMisleading = isMisleading === 'true'

    const factChecks = await db.factCheck.findMany({
      where,
      include: {
        issue: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await db.factCheck.count({ where })

    return NextResponse.json({
      success: true,
      data: factChecks,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching fact checks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch fact checks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      issueId,
      claim,
      reality,
      isMisleading = false,
      sources = '',
      verifiedBy
    } = body

    if (!issueId || !claim || !reality) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if issue exists
    const issue = await db.issue.findUnique({
      where: { id: issueId }
    })

    if (!issue) {
      return NextResponse.json(
        { success: false, error: 'Issue not found' },
        { status: 404 }
      )
    }

    const factCheck = await db.factCheck.create({
      data: {
        issueId,
        claim,
        reality,
        isMisleading,
        sources,
        verifiedBy,
        verifiedAt: verifiedBy ? new Date() : null
      },
      include: {
        issue: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true
          }
        }
      }
    })

    // Add timeline entry
    await db.issueTimeline.create({
      data: {
        issueId,
        eventType: 'updated',
        description: `फैक्ट चेक जोड़ा गया: ${claim}`,
        source: 'fact_check'
      }
    })

    return NextResponse.json({
      success: true,
      data: factCheck
    })
  } catch (error) {
    console.error('Error creating fact check:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create fact check' },
      { status: 500 }
    )
  }
}