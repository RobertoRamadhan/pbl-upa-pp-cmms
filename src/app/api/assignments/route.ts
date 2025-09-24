import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET - Fetch all assignments
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const technicianId = searchParams.get('technicianId')
    const status = searchParams.get('status')

    const assignments = await prisma.assignment.findMany({
      where: {
        ...(technicianId && { technicianId }),
        ...(status && { status: status as any }),
      },
      include: {
        ticket: true,
        user_assignment_technicianIdTouser: {
          select: {
            name: true,
            technicianprofile: true,
          },
        },
        repairlog: true,
        material: true,
      },
      orderBy: {
        assignedAt: 'desc',
      },
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}

// POST - Create new assignment
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      ticketId,
      technicianId,
      assignedById,
      notes,
    } = body

    const assignment = await prisma.assignment.create({
      data: {
        ticketId,
        technicianId,
        assignedById,
        notes,
      },
      include: {
        ticket: true,
        user_assignment_technicianIdTouser: {
          select: {
            name: true,
          },
        },
      },
    })

    // Update ticket status
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'ASSIGNED' },
    })

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    )
  }
}