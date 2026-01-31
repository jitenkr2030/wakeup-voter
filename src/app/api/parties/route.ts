import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const parties = await db.politicalParty.findMany({
      include: {
        _count: {
          select: {
            leaders: true,
            promises: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: parties
    })
  } catch (error) {
    console.error('Error fetching parties:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch parties' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      shortName,
      description,
      logo,
      foundedYear,
      ideology
    } = body

    if (!name || !shortName) {
      return NextResponse.json(
        { success: false, error: 'Name and short name are required' },
        { status: 400 }
      )
    }

    const party = await db.politicalParty.create({
      data: {
        name,
        shortName,
        description,
        logo,
        foundedYear,
        ideology
      }
    })

    return NextResponse.json({
      success: true,
      data: party
    })
  } catch (error) {
    console.error('Error creating party:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create party' },
      { status: 500 }
    )
  }
}