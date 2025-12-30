import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || 'week'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    switch (range) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Parallel queries for better performance
    const [
      totalTickets,
      completedTickets,
      ticketsByCategory,
      technicians,
      materials
    ] = await Promise.all([
      // Total tickets in range
      prisma.ticket.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: now
          }
        }
      }),

      // Completed tickets in range
      prisma.ticket.count({
        where: {
          status: 'COMPLETED' as any,
          completedAt: {
            gte: startDate,
            lte: now
          }
        }
      }),

      // Tickets by category
      prisma.ticket.groupBy({
        by: ['category'],
        where: {
          createdAt: {
            gte: startDate,
            lte: now
          }
        },
        _count: true
      }),

      // Technician performance
      prisma.user.findMany({
        where: {
          role: 'TECHNICIAN',
          assignment_assignment_technicianIdTouser: {
            some: {
              assignedAt: {
                gte: startDate,
                lte: now
              }
            }
          }
        },
        select: {
          id: true,
          name: true,
          assignment_assignment_technicianIdTouser: {
            where: {
              assignedAt: {
                gte: startDate,
                lte: now
              }
            },
            select: {
              status: true,
              startTime: true,
              endTime: true
            }
          }
        }
      }),

      // Material usage
      prisma.material.groupBy({
        by: ['name'],
        where: {
          assignment: {
            assignedAt: {
              gte: startDate,
              lte: now
            }
          }
        },
        _sum: {
          quantity: true
        }
      })
    ])

    // Calculate average resolution time
    const completedAssignments = await prisma.assignment.findMany({
      where: {
        status: 'COMPLETED',
        startTime: { not: null },
        endTime: { not: null },
        assignedAt: {
          gte: startDate,
          lte: now
        }
      },
      select: {
        startTime: true,
        endTime: true
      }
    })

    const totalHours = completedAssignments.reduce((acc, curr) => {
      if (curr.startTime && curr.endTime) {
        const hours = (curr.endTime.getTime() - curr.startTime.getTime()) / (1000 * 60 * 60)
        return acc + hours
      }
      return acc
    }, 0)

    const averageResolutionTime = completedAssignments.length > 0
      ? (totalHours / completedAssignments.length).toFixed(1)
      : 0

    // Format technician performance data
    const performanceByTechnician = technicians.map(tech => {
      const assignments = tech.assignment_assignment_technicianIdTouser
      const completed = assignments.filter(a => a.status === 'COMPLETED').length
      const total = assignments.length

      return {
        name: tech.name,
        completionRate: total > 0 ? (completed / total * 100).toFixed(1) : 0,
        satisfactionRate: 85 // TODO: Implement actual satisfaction tracking
      }
    })

    // Format material usage data
    const materialUsage = materials.map(m => ({
      material: m.name,
      quantity: m._sum.quantity || 0
    }))

    // Format tickets by category
    const formattedTicketsByCategory = ticketsByCategory.map(t => ({
      category: t.category,
      count: t._count
    }))

    return NextResponse.json({
      totalTickets,
      completedTickets,
      averageResolutionTime,
      ticketsByCategory: formattedTicketsByCategory,
      performanceByTechnician,
      materialUsage
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}