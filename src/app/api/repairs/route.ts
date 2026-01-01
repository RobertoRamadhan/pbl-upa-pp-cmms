import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const technicianId = searchParams.get('technicianId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20'); // Default 20 repairs per page

    const skip = (page - 1) * limit;

    // Get all assignments for the technician with related ticket information
    const assignments = await prisma.assignment.findMany({
      where: {
        technicianId: technicianId ?? undefined
      },
      include: {
        ticket: {
          include: {
            user: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        assignedAt: 'desc'
      }
    });

    // Transform data to match frontend expectations
    const repairs = assignments.map(assignment => ({
      id: assignment.id,
      userId: assignment.ticket.reporterId,
      userName: assignment.ticket.user.name,
      userRole: assignment.ticket.user.role,
      department: assignment.ticket.user.department ?? '',
      location: assignment.ticket.location,
      category: assignment.ticket.category,
      subject: assignment.ticket.subject,
      description: assignment.ticket.description,
      priority: assignment.ticket.priority.toLowerCase(),
      status: assignment.status.toLowerCase(),
      submitDate: assignment.ticket.createdAt,
      assignedTo: assignment.technicianId,
      assignedDate: assignment.assignedAt,
      startDate: assignment.startTime,
      completionDate: assignment.endTime,
      images: assignment.ticket.attachments ? [assignment.ticket.attachments] : [],
      notes: assignment.notes ? [assignment.notes] : []
    }));

    return NextResponse.json(repairs);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch repairs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      technicianId,
      ticketId,
      status,
      notes
    } = await request.json();

    const assignment = await prisma.assignment.create({
      data: {
        id: `repair_${Date.now()}`,
        technicianId,
        ticketId,
        status: status.toUpperCase(),
        notes,
        assignedById: technicianId, // For now, technician is self-assigning
        updatedAt: new Date(),
      }
    });

    return NextResponse.json(
      { message: 'Repair request created successfully', assignment },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to create repair request' },
      { status: 500 }
    );
  }
}