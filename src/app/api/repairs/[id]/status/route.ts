import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const assignmentId = id;
    const body = await request.json();
    const { status, note, timeSpent, technicianId, action } = body;

    // find assignment to fallback technician or validate
    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const techId = technicianId || assignment.technicianId;

    // Normalize status
    const s = String(status || '').toLowerCase();
    let normalizedStatus: 'ONGOING' | 'COMPLETED' | 'NEED_PARTS' = 'ONGOING';
    if (s === 'completed' || s === 'complete') normalizedStatus = 'COMPLETED';
    else if (s === 'need_parts' || s === 'needparts' || s === 'need parts') normalizedStatus = 'NEED_PARTS';

    // create repair log
    const repairLog = await prisma.repairLog.create({
      data: {
        id: randomUUID(),
        assignment: { connect: { id: assignmentId } },
        user: { connect: { id: techId } },
        description: note || '',
        action: action || (note ? 'NOTE' : ''),
        status: normalizedStatus,
        timeSpent: typeof timeSpent === 'number' ? timeSpent : 0,
      },
      include: {
        user: true,
        assignment: { include: { ticket: true } },
      },
    });

    // Map UI status to assignment_status enum
    const mapAssignmentStatus = (raw: string | undefined) => {
      const r = String(raw || '').toLowerCase();
      if (r === 'in_progress' || r === 'inprogress' || r === 'in progress') return 'IN_PROGRESS';
      if (r === 'pending') return 'PENDING';
      if (r === 'accepted' || r === 'accept') return 'ACCEPTED';
      if (r === 'rejected' || r === 'reject') return 'REJECTED';
      if (r === 'completed' || r === 'complete') return 'COMPLETED';
      return undefined;
    };

    const mappedAssignStatus = mapAssignmentStatus(status || note || (action as string));

    if (mappedAssignStatus) {
  const assignmentUpdateData: Record<string, unknown> = { status: mappedAssignStatus };
      if (mappedAssignStatus === 'IN_PROGRESS') {
        // set startTime when work begins
        assignmentUpdateData.startTime = assignment.startTime || new Date();
      }
      if (mappedAssignStatus === 'COMPLETED') {
        assignmentUpdateData.endTime = new Date();
      }

      await prisma.assignment.update({ where: { id: assignmentId }, data: assignmentUpdateData });

      // Map assignment status to ticket status
      const mapTicketStatus = (as: string) => {
        switch (as) {
          case 'IN_PROGRESS': return 'IN_PROGRESS';
          case 'COMPLETED': return 'COMPLETED';
          case 'PENDING': return 'PENDING';
          case 'ACCEPTED': return 'ASSIGNED';
          case 'REJECTED': return 'CANCELLED';
          default: return undefined;
        }
      };

      const ticketStatus = mapTicketStatus(mappedAssignStatus as string);
      if (ticketStatus) {
  const ticketData: Record<string, unknown> = { status: ticketStatus };
        if (ticketStatus === 'COMPLETED') ticketData.completedAt = new Date();
        await prisma.ticket.update({ where: { id: assignment.ticketId }, data: ticketData, include: { user: true } });

        if (ticketStatus === 'COMPLETED') {
          const ticket = await prisma.ticket.findUnique({ where: { id: assignment.ticketId }, include: { user: true } });
          if (ticket?.user) {
            await prisma.notification.create({ data: { userId: ticket.user.id, message: `Your ticket has been completed: ${ticket.subject}`, type: 'SUCCESS' } });
          }
        }
      }
    }

    return NextResponse.json(repairLog);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
