import { prisma } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'

// GET - Fetch all ticket categories
export async function GET() {
  try {
    const categories = await prisma.ticketCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST - Create new ticket category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Check if category already exists
    const existing = await prisma.ticketCategory.findUnique({
      where: { name: name.trim() }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 409 }
      )
    }

    const category = await prisma.ticketCategory.create({
      data: {
        name: name.trim(),
        description: description?.trim() || undefined,
        isActive: true
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
