import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { assignment_status } from "@prisma/client";

// GET - Fetch all assignments
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const technicianId = searchParams.get("technicianId");
    const status = searchParams.get("status");
    const assignments = await prisma.assignment.findMany({
      where: {
        ...(technicianId && { technicianId }),
        ...(status && { status: status as assignment_status }),
      },
      include: {
        ticket: true,
        technician: {
          select: {
            name: true,
            technicianProfile: true,
          },
        },
        repairLogs: true,
        materials: true,
      },
      orderBy: {
        assignedAt: "desc",
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

// POST - Create new assignment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, technicianId, assignedById, notes } = body;

    let assignedBy = assignedById;
    if (!assignedBy) {
      const admin = await prisma.systemUser.findFirst({ where: { role: 'ADMIN' } });
      if (!admin) {
        return NextResponse.json({ error: 'No admin user found to assign as assignedBy' }, { status: 400 });
      }
      assignedBy = admin.id;
    }

    const assignment = await prisma.assignment.create({
      data: {
        ticketId,
        technicianId,
        assignedById: assignedBy,
        notes,
      },
      include: {
        ticket: true,
        technician: {
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

    // Create notification for the technician
    await prisma.notification.create({
      data: {
        userId: technicianId,
        message: `You have been assigned a new ticket: ${assignment.ticket.subject}`,
        type: 'INFO'  // Using valid NotificationType
      }
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}
