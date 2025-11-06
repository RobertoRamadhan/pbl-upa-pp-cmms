import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch total tickets
    const totalTickets = await prisma.ticket.count()

    // Fetch active assignments
    const activeAssignments = await prisma.assignment.count({
      where: {
        status: 'IN_PROGRESS'
      }
    })

    // Fetch completed tasks
    const completedTasks = await prisma.assignment.count({
      where: {
        status: 'COMPLETED'
      }
    })

    // Calculate average completion time (in hours)
    const completedAssignments = await prisma.assignment.findMany({
      where: {
        status: 'COMPLETED',
        endTime: {
          not: null
        },
        startTime: {
          not: null
        }
      },
      select: {
        startTime: true,
        endTime: true
      }
    })

    let totalHours = 0
    completedAssignments.forEach((assignment) => {
      // Pastikan startTime dan endTime ada
      if (assignment.startTime && assignment.endTime) {
        const diffInMilliseconds = new Date(assignment.endTime).getTime() - new Date(assignment.startTime).getTime()
        const hours = diffInMilliseconds / (1000 * 60 * 60) // Convert to hours
        totalHours += hours
      }
    })
    const avgCompletionTime = completedAssignments.length > 0 
      ? totalHours / completedAssignments.length 
      : 0

    // Fetch technician performance data
    const technicians = await prisma.systemUser.findMany({
      where: {
        role: 'TECHNICIAN'
      },
      include: {
        assignedToMe: {
          where: {
            status: 'COMPLETED'
          }
        },
        technicianProfile: true
      }
    })

    const technicianPerformance = technicians.map((tech: {
      id: string;
      name: string;
      rating?: number | null;
      assignedToMe: {
        startTime: Date | null;
        endTime: Date | null;
      }[];
    }) => {
      const assignments = tech.assignedToMe
      const tasksCompleted = assignments.length
      
      // Calculate on-time percentage (assuming target time is 48 hours)
      const onTimeAssignments = assignments.filter((assignment) => {
        if (assignment.startTime && assignment.endTime) {
          const startTime = new Date(assignment.startTime)
          const endTime = new Date(assignment.endTime)
          const diffInMilliseconds = endTime.getTime() - startTime.getTime()
          const hours = diffInMilliseconds / (1000 * 60 * 60) // Convert to hours
          return hours <= 48
        }
        return false
      })
      
      const onTimePercentage = tasksCompleted > 0 
        ? (onTimeAssignments.length / tasksCompleted) * 100 
        : 0

      // Get average rating if available
      const rating = tech.rating || null

      return {
        id: tech.id,
        name: tech.name,
        tasksCompleted,
        onTimePercentage: parseFloat(onTimePercentage.toFixed(1)),
        rating
      }
    })

    return NextResponse.json({
      stats: {
        totalTickets,
        activeAssignments,
        completedTasks,
        avgCompletionTime: parseFloat(avgCompletionTime.toFixed(1))
      },
      technicians: technicianPerformance
    })

  } catch (error) {
    console.error('Error fetching supervisor dashboard data:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data dashboard' },
      { status: 500 }
    )
  }
}