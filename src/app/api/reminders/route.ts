import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const isActive = searchParams.get('isActive')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const where: any = { userId }
    if (type) where.type = type
    if (isActive !== null) where.isActive = isActive === 'true'

    const reminders = await db.reminder.findMany({
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
      orderBy: { scheduledFor: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: reminders
    })
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reminders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      userId,
      issueId,
      type,
      message,
      scheduledFor
    } = body

    if (!userId || !type || !message || !scheduledFor) {
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

    // If issueId is provided, check if issue exists
    if (issueId) {
      const issue = await db.issue.findUnique({
        where: { id: issueId }
      })

      if (!issue) {
        return NextResponse.json(
          { success: false, error: 'Issue not found' },
          { status: 404 }
        )
      }
    }

    const reminder = await db.reminder.create({
      data: {
        userId,
        issueId,
        type,
        message,
        scheduledFor: new Date(scheduledFor)
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

    return NextResponse.json({
      success: true,
      data: reminder
    })
  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create reminder' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { id, isSent, sentAt, isActive } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Reminder ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (isSent !== undefined) updateData.isSent = isSent
    if (sentAt) updateData.sentAt = new Date(sentAt)
    if (isActive !== undefined) updateData.isActive = isActive

    const reminder = await db.reminder.update({
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

    return NextResponse.json({
      success: true,
      data: reminder
    })
  } catch (error) {
    console.error('Error updating reminder:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update reminder' },
      { status: 500 }
    )
  }
}