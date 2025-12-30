import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const technicianId = searchParams.get("technicianId");

    // Get all assignments for the technician with related ticket information and repair logs
    const assignments = await prisma.assignment.findMany({
      where: {
        technicianId: technicianId ?? undefined,
      },
      include: {
        ticket: {
          include: {
            user: true,
          },
        },
        repairLogs: true,
      },
    });

    // Transform data to match frontend expectations
    const repairs = assignments.map((assignment) => {
      const images: string[] = [];

      if (assignment.ticket.attachments) {
        try {
          const parsed = JSON.parse(assignment.ticket.attachments);
          if (Array.isArray(parsed)) images.push(...parsed);
          else images.push(String(parsed));
        } catch (e) {
          images.push(assignment.ticket.attachments);
        }
      }

      if (assignment.repairLogs && assignment.repairLogs.length) {
        assignment.repairLogs.forEach((log) => {
          if (log.attachments) {
            try {
              const parsed = JSON.parse(log.attachments);
              if (Array.isArray(parsed)) images.push(...parsed);
              else images.push(String(parsed));
            } catch (e) {
              images.push(log.attachments);
            }
          }
        });
      }

      return {
        id: assignment.id,
        userId: assignment.ticket.reporterId,
        userName: assignment.ticket.user.name,
        userRole: assignment.ticket.user.role,
        department: assignment.ticket.user.department ?? "",
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
        images,
        notes: assignment.notes ? [assignment.notes] : [],
      };
    });

    return NextResponse.json(repairs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch repairs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { technicianId, ticketId, status, notes } = await request.json();

    const assignment = await prisma.assignment.create({
      data: {
        id: `repair_${Date.now()}`,
        technicianId,
        ticketId,
        status: status.toUpperCase(),
        notes,
        assignedById: technicianId, // For now, technician is self-assigning
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Repair request created successfully", assignment },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create repair request" },
      { status: 500 }
    );
  }
}
