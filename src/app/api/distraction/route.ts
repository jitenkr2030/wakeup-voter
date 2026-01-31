import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const impactLevel = searchParams.get('impactLevel')
    const isActive = searchParams.get('isActive')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    
    if (category) where.category = category
    if (impactLevel) where.impactLevel = impactLevel
    if (isActive !== null) where.isActive = isActive === 'true'

    const distractions = await db.distraction.findMany({
      where,
      orderBy: { detectedAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await db.distraction.count({ where })

    return NextResponse.json({
      success: true,
      data: distractions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching distractions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch distractions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      title,
      description,
      category,
      impactLevel,
      reason
    } = body

    if (!title || !description || !category || !impactLevel || !reason) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const distraction = await db.distraction.create({
      data: {
        title,
        description,
        category,
        impactLevel,
        reason,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      data: distraction
    })
  } catch (error) {
    console.error('Error creating distraction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create distraction' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { id, isActive } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Distraction ID is required' },
        { status: 400 }
      )
    }

    const distraction = await db.distraction.update({
      where: { id },
      data: { isActive }
    })

    return NextResponse.json({
      success: true,
      data: distraction
    })
  } catch (error) {
    console.error('Error updating distraction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update distraction' },
      { status: 500 }
    )
  }
}