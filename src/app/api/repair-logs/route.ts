import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { repairlog_status } from '@prisma/client'

interface RepairLog {
  id: string;
  assignmentId: string;
  technicianId: string;
  description: string;
  action: string;
  status: repairlog_status;
  timeSpent: number;
  attachments?: string | null;
  technician: {
    name: string | null;
  };
  assignment: {
    startTime: Date | null;
    endTime: Date | null;
    ticket: {
      id: string;
      title: string;
    };
  };
}

// GET - Fetch repair logs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignmentId')
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    let dateFilter = {}
    if (start && end) {
      const startDate = new Date(start)
      const endDate = new Date(end)
      endDate.setHours(23, 59, 59, 999)
      dateFilter = {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    }

    const repairLogs = await prisma.repairlog.findMany({
      where: {
        ...(assignmentId && { assignmentId }),
        ...dateFilter
      },
      include: {
        user: true,
        assignment: {
          include: {
            ticket: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform data for frontend
    const formattedLogs = repairLogs.map(log => ({
      id: log.id,
      ticketId: log.assignment?.ticket?.id || '',
      technicianName: log.user?.name || 'Unknown',
      status: log.status,
      description: log.description,
      timeSpent: log.timeSpent,
      startTime: log.assignment?.startTime || null,
      endTime: log.assignment?.endTime || null,
      ticketTitle: log.assignment?.ticket?.description || '',
      action: log.action
    }))

    return NextResponse.json(formattedLogs)
  } catch (error) {
    console.error('Error fetching repair logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repair logs' },
      { status: 500 }
    )
  }
}

// POST - Create new repair log
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      assignmentId,
      technicianId,
      description,
      action,
      status,
      timeSpent,
      attachments,
    } = body

    const repairLog = await prisma.repairlog.create({
      data: {
        id: '', // Will be auto-generated
        assignment: {
          connect: { id: assignmentId }
        },
        user: {
          connect: { id: technicianId }
        },
        description,
        action,
        status,
        timeSpent,
        attachments,
      },
      include: {
        user: true,
        assignment: {
          include: {
            ticket: true
          }
        }
      },
    })

    // Update assignment status if repair is completed
    if (status === 'COMPLETED') {
      await prisma.assignment.update({
        where: { id: assignmentId },
        data: { 
          status: 'COMPLETED',
          endTime: new Date(),
        },
      })

      // Update ticket status
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        select: { ticketId: true },
      })

      if (assignment) {
        await prisma.ticket.update({
          where: { id: assignment.ticketId },
          data: { 
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        })
      }
    }

    return NextResponse.json(repairLog)
  } catch (error) {
    console.error('Error creating repair log:', error)
    return NextResponse.json(
      { error: 'Failed to create repair log' },
      { status: 500 }
    )
  }
}