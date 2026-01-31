import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pollId = searchParams.get('pollId')
    const userId = searchParams.get('userId')

    const where: any = {}
    
    if (pollId) where.pollId = pollId
    if (userId) where.userId = userId

    const votes = await db.pollVote.findMany({
      where,
      include: {
        poll: {
          select: {
            id: true,
            question: true,
            options: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: votes
    })
  } catch (error) {
    console.error('Error fetching poll votes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch poll votes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      pollId,
      userId,
      option,
      ipAddress,
      userAgent
    } = body

    if (!pollId || !option) {
      return NextResponse.json(
        { success: false, error: 'Poll ID and option are required' },
        { status: 400 }
      )
    }

    // Check if poll exists and is active
    const poll = await db.poll.findUnique({
      where: { id: pollId }
    })

    if (!poll) {
      return NextResponse.json(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      )
    }

    if (!poll.isActive) {
      return NextResponse.json(
        { success: false, error: 'Poll is not active' },
        { status: 400 }
      )
    }

    // Check if poll has ended
    if (poll.endDate && new Date(poll.endDate) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Poll has ended' },
        { status: 400 }
      )
    }

    // Check if user has already voted (if userId is provided)
    if (userId) {
      const existingVote = await db.pollVote.findFirst({
        where: {
          pollId,
          userId
        }
      })

      if (existingVote) {
        return NextResponse.json(
          { success: false, error: 'You have already voted in this poll' },
          { status: 400 }
        )
      }
    }

    // Check if IP has already voted (for anonymous users)
    if (ipAddress) {
      const existingIpVote = await db.pollVote.findFirst({
        where: {
          pollId,
          ipAddress,
          userId: null
        }
      })

      if (existingIpVote) {
        return NextResponse.json(
          { success: false, error: 'You have already voted in this poll' },
          { status: 400 }
        )
      }
    }

    const vote = await db.pollVote.create({
      data: {
        pollId,
        userId,
        option,
        ipAddress,
        userAgent
      }
    })

    // Update poll total votes count
    await db.poll.update({
      where: { id: pollId },
      data: {
        totalVotes: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: vote
    })
  } catch (error) {
    console.error('Error creating poll vote:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create poll vote' },
      { status: 500 }
    )
  }
}