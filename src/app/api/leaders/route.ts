import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const partyId = searchParams.get('partyId')
    const state = searchParams.get('state')
    const isActive = searchParams.get('isActive')

    const where: any = {}
    
    if (partyId) where.partyId = partyId
    if (state) where.state = state
    if (isActive !== null) where.isActive = isActive === 'true'

    const leaders = await db.politicalLeader.findMany({
      where,
      include: {
        party: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logo: true
          }
        },
        _count: {
          select: {
            promises: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: leaders
    })
  } catch (error) {
    console.error('Error fetching leaders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      partyId,
      position,
      state,
      constituency,
      photo,
      bio,
      isActive = true
    } = body

    if (!name || !partyId) {
      return NextResponse.json(
        { success: false, error: 'Name and party ID are required' },
        { status: 400 }
      )
    }

    // Check if party exists
    const party = await db.politicalParty.findUnique({
      where: { id: partyId }
    })

    if (!party) {
      return NextResponse.json(
        { success: false, error: 'Political party not found' },
        { status: 404 }
      )
    }

    const leader = await db.politicalLeader.create({
      data: {
        name,
        partyId,
        position,
        state,
        constituency,
        photo,
        bio,
        isActive
      },
      include: {
        party: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logo: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: leader
    })
  } catch (error) {
    console.error('Error creating leader:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create leader' },
      { status: 500 }
    )
  }
}