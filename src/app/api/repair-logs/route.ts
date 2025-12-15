import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// GET - Fetch repair logs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    let dateFilter = {};
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      dateFilter = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    const repairLogs = await prisma.repairLog.findMany({
      where: {
        ...(assignmentId && { assignmentId }),
        ...dateFilter,
      },
      include: {
        user: true,
        assignment: {
          include: {
            ticket: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data for frontend
    type FormattedLog = {
      id: string;
      ticketId: string;
      technicianName: string;
      status: string;
      description: string;
      timeSpent: number;
      startTime: Date | null;
      endTime: Date | null;
      ticketTitle: string;
      action: string;
    };

    const formattedLogs: FormattedLog[] = repairLogs.map((log) => ({
      id: log.id,
      ticketId: log.assignment?.ticket?.id || "",
      technicianName: log.user?.name || "Unknown",
      status: log.status,
      description: log.description,
      timeSpent: log.timeSpent,
      startTime: log.assignment?.startTime || null,
      endTime: log.assignment?.endTime || null,
      ticketTitle: log.assignment?.ticket?.subject || "",
      action: log.action,
    }));

    return NextResponse.json(formattedLogs);
  } catch (error) {
    console.error("Error fetching repair logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch repair logs" },
      { status: 500 }
    );
  }
}

// POST - Create new repair log
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      assignmentId,
      technicianId,
      description,
      action,
      status,
      timeSpent,
      attachments,
    } = body;

    // Normalize status value to Prisma enum (repairlog_status)
    const rawStatus = String(status || '').toLowerCase();
    const isClosed = rawStatus.includes('close');
    let normalizedRepairStatus: 'ONGOING' | 'COMPLETED' | 'NEED_PARTS' = 'ONGOING';
    if (rawStatus === 'completed' || rawStatus === 'complete' || isClosed) normalizedRepairStatus = 'COMPLETED';
    else if (rawStatus === 'need_parts' || rawStatus === 'needparts' || rawStatus === 'need parts') normalizedRepairStatus = 'NEED_PARTS';

    const repairLog = await prisma.repairLog.create({
      data: {
        id: randomUUID(),
        assignment: {
          connect: { id: assignmentId },
        },
        user: {
          connect: { id: technicianId },
        },
        description,
        action,
        status: normalizedRepairStatus,
        timeSpent,
        attachments,
      },
      include: {
        user: true,
        assignment: {
          include: {
            ticket: true,
          },
        },
      },
    });
    // Update assignment/ticket state if the normalized status means completed
    if (normalizedRepairStatus === 'COMPLETED') {
      // If the raw status indicates 'closed' (e.g. 'closed' or 'close'), mark assignment/ticket as CLOSED
      const assignmentStatus = isClosed ? 'CLOSED' : 'COMPLETED';
      await prisma.assignment.update({
        where: { id: assignmentId },
        data: {
          status: assignmentStatus,
          endTime: new Date(),
        },
      });

      // Update ticket status
      const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId }, select: { ticketId: true } });
      if (assignment) {
        const ticketStatus = isClosed ? 'CLOSED' : 'COMPLETED';
        const ticket = await prisma.ticket.update({
          where: { id: assignment.ticketId },
          data: { status: ticketStatus, completedAt: new Date() },
          include: { user: true },
        });

        if (ticket.user) {
          const message = isClosed ? `Your ticket has been closed: ${ticket.subject}` : `Your ticket has been completed: ${ticket.subject}`;
          await prisma.notification.create({ data: { userId: ticket.user.id, message, type: 'SUCCESS' } });
        }
      }
    }

    return NextResponse.json(repairLog);
  } catch (error) {
    console.error("Error creating repair log:", error);
    return NextResponse.json(
      { error: "Failed to create repair log" },
      { status: 500 }
    );
  }
}
