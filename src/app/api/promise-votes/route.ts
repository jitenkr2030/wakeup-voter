import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const promiseId = searchParams.get('promiseId')
    const userId = searchParams.get('userId')

    const where: any = {}
    
    if (promiseId) where.promiseId = promiseId
    if (userId) where.userId = userId

    const votes = await db.promiseVote.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        promise: {
          select: {
            id: true,
            title: true,
            status: true
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
    console.error('Error fetching promise votes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promise votes' },
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
      vote,
      confidence = 3,
      comment,
      isAnonymous = false
    } = body

    if (!promiseId || !userId || !vote) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate vote value
    const validVotes = ['fulfilled', 'partially_fulfilled', 'broken', 'not_applicable']
    if (!validVotes.includes(vote)) {
      return NextResponse.json(
        { success: false, error: 'Invalid vote value' },
        { status: 400 }
      )
    }

    // Validate confidence level
    if (confidence < 1 || confidence > 5) {
      return NextResponse.json(
        { success: false, error: 'Confidence must be between 1 and 5' },
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

    // Check if user has already voted for this promise
    const existingVote = await db.promiseVote.findUnique({
      where: {
        promiseId_userId: {
          promiseId,
          userId
        }
      }
    })

    let promiseVote;
    if (existingVote) {
      // Update existing vote
      promiseVote = await db.promiseVote.update({
        where: { id: existingVote.id },
        data: {
          vote,
          confidence,
          comment,
          isAnonymous
        },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          },
          promise: {
            select: {
              id: true,
              title: true,
              status: true
            }
          }
        }
      })
    } else {
      // Create new vote
      promiseVote = await db.promiseVote.create({
        data: {
          promiseId,
          userId,
          vote,
          confidence,
          comment,
          isAnonymous
        },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          },
          promise: {
            select: {
              id: true,
              title: true,
              status: true
            }
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: promiseVote
    })
  } catch (error) {
    console.error('Error creating promise vote:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create promise vote' },
      { status: 500 }
    )
  }
}