import { prisma } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'

// GET - Fetch all assets or filter by category/location
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const status = searchParams.get('status')
    const needsMaintenance = searchParams.get('needsMaintenance')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25') // Default 25 assets per page

    const where: Record<string, any> = {}
    
    if (category) where.category = category
    if (location) where.location = location
    if (status) where.status = status
    if (needsMaintenance === 'true') {
      where.nextMaintenance = {
        lte: new Date()
      }
    }

    const skip = (page - 1) * limit

    const assets = await prisma.asset.findMany({
      where,
      include: {
        maintenanceHistory: {
          take: 1,
          orderBy: {
            performedAt: 'desc'
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(assets)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    )
  }
}

// POST - Create new asset
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      code,
      name,
      category,
      location,
      status,
      purchaseDate,
      specifications,
    } = body

    // Generate QR Code content
    const qrContent = JSON.stringify({
      code,
      name,
      category,
      location
    })

    const asset = await prisma.asset.create({
      data: {
        code,
        name,
        category,
        location,
        status,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        specifications,
        qrCode: qrContent,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Error creating asset:', error)
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    )
  }
}

// PUT - Update asset
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      name,
      category,
      location,
      status,
      specifications,
      lastMaintenance,
      nextMaintenance
    } = body

    const asset = await prisma.asset.update({
      where: { id },
      data: {
        name,
        category,
        location,
        status,
        specifications,
        lastMaintenance: lastMaintenance ? new Date(lastMaintenance) : undefined,
        nextMaintenance: nextMaintenance ? new Date(nextMaintenance) : undefined,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Error updating asset:', error)
    return NextResponse.json(
      { error: 'Failed to update asset' },
      { status: 500 }
    )
  }
}