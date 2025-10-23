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
            technicianProfile: true,
          },
        },
        repairLogs: true,
        materials: true,
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

    // Create assignment and update ticket in transaction
    const [assignment] = await prisma.$transaction([
      prisma.assignment.create({
        data: {
          notes,
          ticket: {
            connect: { id: ticketId }
          },
          user_assignment_technicianIdTouser: {
            connect: { id: technicianId }
          },
          user_assignment_assignedByIdTouser: {
            connect: { id: assignedById }
          }
        },
        include: {
          ticket: true,
          user_assignment_technicianIdTouser: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.ticket.update({
        where: { id: ticketId },
        data: { status: 'ASSIGNED' },
      })
    ]);

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    )
  }
}