import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const promiseId = searchParams.get('promiseId')
    const rating = searchParams.get('rating')

    const where: any = {}
    
    if (promiseId) where.promiseId = promiseId
    if (rating) where.rating = rating

    const factChecks = await db.promiseFactCheck.findMany({
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
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: factChecks
    })
  } catch (error) {
    console.error('Error fetching promise fact checks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promise fact checks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      promiseId,
      claim,
      reality,
      rating,
      sources = '',
      verifiedBy
    } = body

    if (!promiseId || !claim || !reality || !rating) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate rating
    const validRatings = ['true', 'mostly_true', 'half_true', 'mostly_false', 'false']
    if (!validRatings.includes(rating)) {
      return NextResponse.json(
        { success: false, error: 'Invalid rating' },
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

    const factCheck = await db.promiseFactCheck.create({
      data: {
        promiseId,
        claim,
        reality,
        rating,
        sources,
        verifiedBy,
        verifiedAt: verifiedBy ? new Date() : null
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

    // Update promise verification level if this is an official verification
    if (verifiedBy) {
      await db.politicalPromise.update({
        where: { id: promiseId },
        data: {
          verificationLevel: 'verified',
          isVerified: true,
          verifiedBy,
          verifiedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: factCheck
    })
  } catch (error) {
    console.error('Error creating promise fact check:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create promise fact check' },
      { status: 500 }
    )
  }
}