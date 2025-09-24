import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const technicianId = searchParams.get('technicianId')

    if (!technicianId) {
      return NextResponse.json(
        { error: 'Technician ID is required' },
        { status: 400 }
      )
    }

    // Get assignments for performance calculation
    const assignments = await prisma.assignment.findMany({
      where: {
        technicianId,
        status: 'COMPLETED',
      },
      include: {
        ticket: true,
        repairlog: true,
      },
    })

    // Calculate performance metrics
    const totalAssignments = assignments.length
    const onTimeCompletions = assignments.filter(assignment => {
      const completionTime = assignment.endTime
      const assignedTime = assignment.assignedAt
      if (!completionTime || !assignedTime) return false

      // Calculate time difference in hours
      const timeDiff = (completionTime.getTime() - assignedTime.getTime()) / (1000 * 60 * 60)
      
      // Consider completion within 48 hours as on time (can be adjusted)
      return timeDiff <= 48
    }).length

    const performance = {
      totalAssignments,
      completedOnTime: onTimeCompletions,
      completedLate: totalAssignments - onTimeCompletions,
      onTimePercentage: totalAssignments > 0 ? (onTimeCompletions / totalAssignments) * 100 : 0,
      averageCompletionTime: assignments.reduce((acc, curr) => {
        if (curr.endTime && curr.assignedAt) {
          return acc + (curr.endTime.getTime() - curr.assignedAt.getTime()) / (1000 * 60 * 60)
        }
        return acc
      }, 0) / (totalAssignments || 1), // in hours
    }

    return NextResponse.json(performance)
  } catch (error) {
    console.error('Error fetching performance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    )
  }
}