import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const issueId = searchParams.get('issueId')
    const userId = searchParams.get('userId')
    const isExpert = searchParams.get('isExpert')
    const isModerated = searchParams.get('isModerated')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = { isDeleted: false }
    
    if (issueId) where.issueId = issueId
    if (userId) where.userId = userId
    if (isExpert !== null) where.isExpert = isExpert === 'true'
    if (isModerated !== null) where.isModerated = isModerated === 'true'

    const discussions = await db.discussion.findMany({
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
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await db.discussion.count({ where })

    return NextResponse.json({
      success: true,
      data: discussions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching discussions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch discussions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      issueId,
      userId,
      content,
      isExpert = false,
      expertField
    } = body

    if (!issueId || !userId || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user and issue exist
    const [user, issue] = await Promise.all([
      db.user.findUnique({ where: { id: userId } }),
      db.issue.findUnique({ where: { id: issueId } })
    ])

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    if (!issue) {
      return NextResponse.json(
        { success: false, error: 'Issue not found' },
        { status: 404 }
      )
    }

    // Basic content moderation - check for inappropriate content
    const inappropriateWords = ['abuse', 'caste', 'religion', 'hate', 'violence']
    const hasInappropriateContent = inappropriateWords.some(word => 
      content.toLowerCase().includes(word)
    )

    if (hasInappropriateContent) {
      return NextResponse.json(
        { success: false, error: 'Content contains inappropriate language' },
        { status: 400 }
      )
    }

    const discussion = await db.discussion.create({
      data: {
        issueId,
        userId,
        content,
        isExpert,
        expertField,
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
        issue: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: discussion
    })
  } catch (error) {
    console.error('Error creating discussion:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create discussion' },
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
      isDeleted 
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Discussion ID is required' },
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

    const discussion = await db.discussion.update({
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
        issue: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: discussion
    })
  } catch (error) {
    console.error('Error updating discussion:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update discussion' },
      { status: 500 }
    )
  }
}