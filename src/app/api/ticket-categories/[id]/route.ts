import { prisma } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT - Update ticket category
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, isActive } = body

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Check if category exists
    const existing = await prisma.ticketCategory.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if new name already exists (and it's not the same category)
    const duplicate = await prisma.ticketCategory.findFirst({
      where: {
        name: name.trim(),
        id: { not: id }
      }
    })

    if (duplicate) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 409 }
      )
    }

    const category = await prisma.ticketCategory.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || undefined,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE - Delete ticket category
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params

    // Check if category exists
    const existing = await prisma.ticketCategory.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if category is being used by any tickets
    const ticketsCount = await prisma.ticket.count({
      where: { categoryId: id }
    })

    if (ticketsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category - it's being used by ${ticketsCount} ticket(s)` },
        { status: 409 }
      )
    }

    // Soft delete by marking as inactive
    const category = await prisma.ticketCategory.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
