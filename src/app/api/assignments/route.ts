import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { assignment_status } from "@prisma/client";

// GET - Fetch all assignments with pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const technicianId = searchParams.get("technicianId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10"); // Default 10 per page
    
    const skip = (page - 1) * limit;
    
    const assignments = await prisma.assignment.findMany({
      where: {
        ...(technicianId && { technicianId }),
        ...(status && { status: status as assignment_status }),
      },
      skip,
      take: limit,
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

    // Get ticket to check priority/severity
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { priority: true, severity: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Determine if needs supervisor verification
    // True jika priority HIGH/URGENT atau severity HIGH/CRITICAL
    const needsVerification = 
      ticket.priority === 'HIGH' || 
      ticket.priority === 'URGENT' || 
      ticket.severity === 'HIGH' || 
      ticket.severity === 'CRITICAL';

    // Generate assignment ID: ASG-####, or ASG-###[LETTER] if >9999
    const randomNum = Math.floor(Math.random() * 10000);
    let assignmentId: string;
    if (randomNum <= 9999) {
      assignmentId = `ASG-${String(randomNum).padStart(4, '0')}`;
    } else {
      const num = randomNum % 10000;
      const letter = String.fromCharCode(65 + Math.floor(randomNum / 10000) % 26); // A-Z
      assignmentId = `ASG-${String(num).padStart(3, '0')}${letter}`;
    }

    const assignment = await prisma.assignment.create({
      data: {
        id: assignmentId,
        ticketId,
        technicianId,
        assignedById: assignedBy,
        notes,
        needsVerification,
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

    // Update ticket status ke ASSIGNED
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'ASSIGNED' as any },
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
