import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const promiseId = searchParams.get('promiseId')
    const userId = searchParams.get('userId')
    const isModerated = searchParams.get('isModerated')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = { isDeleted: false }
    
    if (promiseId) where.promiseId = promiseId
    if (userId) where.userId = userId
    if (isModerated !== null) where.isModerated = isModerated === 'true'

    const comments = await db.promiseComment.findMany({
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
        promise: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await db.promiseComment.count({ where })

    return NextResponse.json({
      success: true,
      data: comments,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching promise comments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promise comments' },
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
      content,
      isAnonymous = false
    } = body

    if (!promiseId || !userId || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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

    // Basic content moderation
    const inappropriateWords = ['abuse', 'caste', 'religion', 'hate', 'violence', 'threat']
    const hasInappropriateContent = inappropriateWords.some(word => 
      content.toLowerCase().includes(word)
    )

    if (hasInappropriateContent) {
      return NextResponse.json(
        { success: false, error: 'Content contains inappropriate language' },
        { status: 400 }
      )
    }

    const comment = await db.promiseComment.create({
      data: {
        promiseId,
        userId,
        content,
        isAnonymous,
        isModerated: false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true
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

    return NextResponse.json({
      success: true,
      data: comment
    })
  } catch (error) {
    console.error('Error creating promise comment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create promise comment' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      id, 
      isModerated, 
      moderatedBy, 
      isDeleted,
      upvotes,
      downvotes
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (isModerated !== undefined) {
      updateData.isModerated = isModerated
      updateData.moderatedAt = new Date()
      if (moderatedBy) updateData.moderatedBy = moderatedBy
    }
    if (isDeleted !== undefined) updateData.isDeleted = isDeleted
    if (upvotes !== undefined) updateData.upvotes = upvotes
    if (downvotes !== undefined) updateData.downvotes = downvotes

    const comment = await db.promiseComment.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true
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

    return NextResponse.json({
      success: true,
      data: comment
    })
  } catch (error) {
    console.error('Error updating promise comment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update promise comment' },
      { status: 500 }
    )
  }
}