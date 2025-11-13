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
        ...(status && { status: status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' }),
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
            technician: {
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

    if (!Array.isArray(tickets)) {
      throw new Error('Invalid tickets data format');
    }
    
    const sanitizedTickets = tickets.map(ticket => ({
      ...ticket,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString()
    }));

    return NextResponse.json(sanitizedTickets)
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
    const body = await request.json();
    const {
      category,
      subject,
      description,
      location,
      priority
    } = body;

    // Generate unique ticket number
    const ticketNumber = `TCKT-${Date.now()}`;

    // Get current authenticated user (reporterId)
    // TODO: Replace this with proper auth check
    const user = await prisma.systemUser.findFirst({
      where: { role: 'STAFF' }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        id: `TCK-${Date.now()}`,
        ticketNumber,
        category,
        subject,
        description,
        location,
        priority: priority as 'LOW' | 'MEDIUM' | 'HIGH',
        status: 'PENDING',
        reporterId: user.id,
        updatedAt: new Date()
      },
    });

    // Create notification for admin
    const admins = await prisma.systemUser.findMany({
      where: { role: 'ADMIN' }
    });

    // Create notifications for all admins
    await Promise.all(admins.map((admin: { id: string }) => 
      prisma.notification.create({
        data: {
          userId: admin.id,
          message: `New ticket created: ${subject} (${ticketNumber})`,
          type: 'INFO'  // Changed to use valid NotificationType
        }
      })
    ));

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a ticket by id
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Ticket id is required' }, { status: 400 });
    }

    // Ensure ticket exists
    const existing = await prisma.ticket.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // If there is an assignment referencing this ticket, remove dependent records first
  const assignment = await prisma.assignment.findUnique({ where: { ticketId: id } });
    if (assignment) {
      // delete repair logs and materials linked to the assignment, then delete the assignment
      await prisma.$transaction([
        prisma.repairLog.deleteMany({ where: { assignmentId: assignment.id } }),
        prisma.material.deleteMany({ where: { assignmentId: assignment.id } }),
        prisma.assignment.delete({ where: { id: assignment.id } }),
      ]);
    }

    // Now delete the ticket itself
    await prisma.ticket.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
  }
}