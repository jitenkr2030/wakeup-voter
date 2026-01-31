import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const partyId = searchParams.get('partyId')
    const leaderId = searchParams.get('leaderId')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const electionYear = searchParams.get('electionYear')
    const state = searchParams.get('state')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    
    if (partyId) where.partyId = partyId
    if (leaderId) where.leaderId = leaderId
    if (category) where.category = category
    if (status) where.status = status
    if (electionYear) where.electionYear = parseInt(electionYear)
    if (state) where.state = state

    const promises = await db.politicalPromise.findMany({
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
        leader: {
          select: {
            id: true,
            name: true,
            position: true,
            photo: true
          }
        },
        _count: {
          select: {
            votes: true,
            comments: true,
            factChecks: true
          }
        }
      },
      orderBy: [
        { promiseDate: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    const total = await db.politicalPromise.count({ where })

    return NextResponse.json({
      success: true,
      data: promises,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching promises:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promises' },
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
      subcategory,
      partyId,
      leaderId,
      electionYear,
      state,
      constituency,
      promiseDate,
      promiseLocation,
      sourceUrl,
      sourceType,
      evidenceUrl,
      evidenceType,
      tags = ''
    } = body

    if (!title || !description || !category || !partyId || !electionYear || !promiseDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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

    // If leaderId is provided, check if leader exists
    if (leaderId) {
      const leader = await db.politicalLeader.findUnique({
        where: { id: leaderId }
      })

      if (!leader) {
        return NextResponse.json(
          { success: false, error: 'Political leader not found' },
          { status: 404 }
        )
      }
    }

    const promise = await db.politicalPromise.create({
      data: {
        title,
        description,
        category,
        subcategory,
        partyId,
        leaderId,
        electionYear,
        state,
        constituency,
        promiseDate: new Date(promiseDate),
        promiseLocation,
        sourceUrl,
        sourceType,
        evidenceUrl,
        evidenceType,
        tags,
        status: 'pending',
        verificationLevel: 'unverified',
        isVerified: false
      },
      include: {
        party: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logo: true
          }
        },
        leader: {
          select: {
            id: true,
            name: true,
            position: true,
            photo: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: promise
    })
  } catch (error) {
    console.error('Error creating promise:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create promise' },
      { status: 500 }
    )
  }
}