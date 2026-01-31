import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const promiseId = searchParams.get('promiseId')
    const isActive = searchParams.get('isActive')

    const where: any = {}
    
    if (userId) where.userId = userId
    if (promiseId) where.promiseId = promiseId
    if (isActive !== null) where.isActive = isActive === 'true'

    const reminders = await db.promiseReminder.findMany({
      where,
      include: {
        promise: {
          select: {
            id: true,
            title: true,
            status: true,
            party: {
              select: {
                name: true,
                shortName: true
              }
            }
          }
        }
      },
      orderBy: { nextDue: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: reminders
    })
  } catch (error) {
    console.error('Error fetching promise reminders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promise reminders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      promiseId,
      userId,
      type = 'monthly',
      frequency = '30d',
      isActive = true
    } = body

    if (!promiseId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Promise ID and User ID are required' },
        { status: 400 }
      )
    }

    // Check if promise exists
    const promise = await db.politicalPromise.findUnique({
      where: { id: promiseId }
    })

    if (!promise) {
      return NextResponse.json(
        { success: false, error: 'Promise not found' },
        { status: 404 }
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

    // Calculate next due date
    const now = new Date()
    const nextDue = new Date(now)
    const daysToAdd = parseInt(frequency) || 30
    nextDue.setDate(nextDue.getDate() + daysToAdd)

    const reminder = await db.promiseReminder.create({
      data: {
        promiseId,
        userId,
        type,
        frequency,
        isActive,
        nextDue
      },
      include: {
        promise: {
          select: {
            id: true,
            title: true,
            status: true,
            party: {
              select: {
                name: true,
                shortName: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: reminder
    })
  } catch (error) {
    console.error('Error creating promise reminder:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create promise reminder' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      id, 
      isActive, 
      lastSent, 
      nextDue 
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Reminder ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (isActive !== undefined) updateData.isActive = isActive
    if (lastSent) updateData.lastSent = new Date(lastSent)
    if (nextDue) updateData.nextDue = new Date(nextDue)

    const reminder = await db.promiseReminder.update({
      where: { id },
      data: updateData,
      include: {
        promise: {
          select: {
            id: true,
            title: true,
            status: true,
            party: {
              select: {
                name: true,
                shortName: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: reminder
    })
  } catch (error) {
    console.error('Error updating promise reminder:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update promise reminder' },
      { status: 500 }
    )
  }
}