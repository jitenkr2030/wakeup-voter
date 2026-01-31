import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const promiseId = searchParams.get('promiseId')
    const isActive = searchParams.get('isActive')

    const where: any = {}
    
    if (promiseId) where.promiseId = promiseId
    if (isActive !== null) where.isActive = isActive === 'true'

    const polls = await db.poll.findMany({
      where,
      include: {
        promise: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        _count: {
          select: {
            votes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: polls
    })
  } catch (error) {
    console.error('Error fetching polls:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch polls' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      question,
      promiseId,
      options,
      isActive = true,
      endDate
    } = body

    if (!question || !options) {
      return NextResponse.json(
        { success: false, error: 'Question and options are required' },
        { status: 400 }
      )
    }

    // If promiseId is provided, check if promise exists
    if (promiseId) {
      const promise = await db.politicalPromise.findUnique({
        where: { id: promiseId }
      })

      if (!promise) {
        return NextResponse.json(
          { success: false, error: 'Promise not found' },
          { status: 404 }
        )
      }
    }

    const poll = await db.poll.create({
      data: {
        question,
        promiseId,
        options: JSON.stringify(options),
        isActive,
        endDate: endDate ? new Date(endDate) : null
      },
      include: {
        promise: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: poll
    })
  } catch (error) {
    console.error('Error creating poll:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create poll' },
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
      totalVotes 
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Poll ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (isActive !== undefined) updateData.isActive = isActive
    if (totalVotes !== undefined) updateData.totalVotes = totalVotes

    const poll = await db.poll.update({
      where: { id },
      data: updateData,
      include: {
        promise: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: poll
    })
  } catch (error) {
    console.error('Error updating poll:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update poll' },
      { status: 500 }
    )
  }
}