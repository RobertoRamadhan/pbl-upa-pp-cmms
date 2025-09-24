import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET - Fetch all tickets
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    const tickets = await prisma.ticket.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(userId && { reporterId: userId }),
      },
      include: {
        user: {
          select: {
            name: true,
            department: true,
          },
        },
        assignment: {
          include: {
            user_assignment_technicianIdTouser: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(tickets)
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}

// POST - Create new ticket
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      category,
      subject,
      description,
      location,
      priority,
      reporterId,
      attachments,
    } = body

    const ticketNumber = `TCKT-${Date.now()}`

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        category,
        subject,
        description,
        location,
        priority,
        reporterId,
        attachments,
      },
    })

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}