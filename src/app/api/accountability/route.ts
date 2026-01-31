import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const issueId = searchParams.get('issueId')
    const status = searchParams.get('status')
    const promiseType = searchParams.get('promiseType')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    
    if (issueId) where.issueId = issueId
    if (status) where.status = status
    if (promiseType) where.promiseType = promiseType

    const accountability = await db.accountability.findMany({
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
      orderBy: [
        { promisedDate: 'desc' },
        { lastUpdated: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    const total = await db.accountability.count({ where })

    return NextResponse.json({
      success: true,
      data: accountability,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching accountability data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch accountability data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      issueId,
      promiseType,
      promisor,
      promise,
      promisedDate,
      expectedAction
    } = body

    if (!issueId || !promiseType || !promisor || !promise || !promisedDate || !expectedAction) {
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

    const accountability = await db.accountability.create({
      data: {
        issueId,
        promiseType,
        promisor,
        promise,
        promisedDate: new Date(promisedDate),
        expectedAction,
        status: 'pending'
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
        description: `वादा दर्ज किया गया: ${promise}`,
        source: 'accountability'
      }
    })

    return NextResponse.json({
      success: true,
      data: accountability
    })
  } catch (error) {
    console.error('Error creating accountability record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create accountability record' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      id, 
      actualAction, 
      status, 
      completedAt 
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Accountability ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (actualAction !== undefined) updateData.actualAction = actualAction
    if (status) updateData.status = status
    if (completedAt) updateData.completedAt = new Date(completedAt)
    else if (status === 'completed') updateData.completedAt = new Date()

    const accountability = await db.accountability.update({
      where: { id },
      data: updateData,
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
        issueId: accountability.issueId,
        eventType: 'updated',
        description: `वादा स्थिति अपडेट: ${status}`,
        source: 'accountability'
      }
    })

    return NextResponse.json({
      success: true,
      data: accountability
    })
  } catch (error) {
    console.error('Error updating accountability record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update accountability record' },
      { status: 500 }
    )
  }
}