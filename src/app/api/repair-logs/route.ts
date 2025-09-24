import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET - Fetch repair logs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignmentId')

    const repairLogs = await prisma.repairLog.findMany({
      where: {
        ...(assignmentId && { assignmentId }),
      },
      include: {
        technician: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(repairLogs)
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

    const repairLog = await prisma.repairLog.create({
      data: {
        assignmentId,
        technicianId,
        description,
        action,
        status,
        timeSpent,
        attachments,
      },
      include: {
        technician: {
          select: {
            name: true,
          },
        },
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