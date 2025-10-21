import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { user_role, assignment_status } from '@prisma/client'

export async function GET() {
  try {
    // Fetch total tickets
    const totalTickets = await prisma.ticket.count()

    // Fetch active assignments
    const activeAssignments = await prisma.assignment.count({
      where: {
        status: assignment_status.IN_PROGRESS
      }
    })

    // Fetch completed tasks
    const completedTasks = await prisma.assignment.count({
      where: {
        status: assignment_status.COMPLETED
      }
    })

    // Calculate average completion time (in hours)
    const completedAssignments = await prisma.assignment.findMany({
      where: {
        status: assignment_status.COMPLETED,
        endTime: {
          not: null
        }
      },
      select: {
        startTime: true,
        endTime: true
      }
    })

    let totalHours = 0
    completedAssignments.forEach(assignment => {
      if (assignment.startTime && assignment.endTime) {
        const hours = Math.abs(assignment.endTime.getTime() - assignment.startTime.getTime()) / 36e5
        totalHours += hours
      }
    })
    const avgCompletionTime = completedAssignments.length > 0 
      ? totalHours / completedAssignments.length 
      : 0

    // Fetch technician performance data
    const technicians = await prisma.user.findMany({
      where: {
        role: 'TECHNICIAN' as user_role
      },
      include: {
        assignment_assignment_technicianIdTouser: {
          where: {
            status: assignment_status.COMPLETED
          }
        }
      }
    })

    const technicianPerformance = technicians.map(tech => {
      const assignments = tech.assignment_assignment_technicianIdTouser
      const tasksCompleted = assignments.length
      
      // Calculate on-time percentage (assuming target time is 48 hours)
      const onTimeAssignments = assignments.filter(assignment => {
        if (assignment.startTime && assignment.endTime) {
          const hours = Math.abs(assignment.endTime.getTime() - assignment.startTime.getTime()) / 36e5
          return hours <= 48
        }
        return false
      })
      
      const onTimePercentage = tasksCompleted > 0 
        ? (onTimeAssignments.length / tasksCompleted) * 100 
        : 0

      return {
        id: tech.id,
        name: tech.name || 'Unknown',
        tasksCompleted,
        onTimePercentage: parseFloat(onTimePercentage.toFixed(1))
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