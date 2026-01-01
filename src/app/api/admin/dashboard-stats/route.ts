import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

export const revalidate = 60; // Cache response for 60 seconds

export async function GET(request: NextRequest) {
  try {
    // Check authentication and role
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing auth headers' },
        { status: 401 }
      );
    }

    if (userRole.toUpperCase() !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid role' },
        { status: 401 }
      );
    }

    // Verify user exists and is active
    const user = await prisma.systemUser.findUnique({
      where: {
        id: userId,
        isActive: true,
        role: 'ADMIN'
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found or not authorized' },
        { status: 401 }
      );
    }
    
    // Calculate 7 days ago cutoff
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get current statistics with error handling
    let ticketStats;
    try {
      ticketStats = await prisma.ticket.groupBy({
        by: ['status'],
        where: {
          OR: [
            // Include all non-completed tickets
            { NOT: { status: 'COMPLETED' } },
            // Include completed tickets from last 7 days only
            {
              status: 'COMPLETED' as any,
              completedAt: {
                gte: sevenDaysAgo
              }
            }
          ]
        },
        _count: {
          status: true
        }
      });
      
      console.log('Raw ticket stats:', ticketStats);
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ticket statistics' },
        { status: 500 }
      );
    }

    console.log('Ticket statistics:', ticketStats);

    const assignmentCount = await prisma.assignment.count({
      where: {
        NOT: {
          status: 'REJECTED'
        }
      }
    });

    // Calculate totals dengan status enum asli
    const pending = ticketStats.find(stat => stat.status === 'PENDING')?._count.status || 0;
    const inProgress = ticketStats.find(stat => stat.status === 'IN_PROGRESS')?._count.status || 0;
    const completed = ticketStats.find(stat => stat.status === 'COMPLETED')?._count.status || 0;
    const totalAssignments = assignmentCount;

    console.log('Fetching recent assignments...');
    
    // Fetch recent assignments with detailed information and error handling
    let recentAssignments;
    try {
      recentAssignments = await prisma.assignment.findMany({
        take: 5,
        orderBy: {
          assignedAt: 'desc'
        },
        include: {
          ticket: {
            select: {
              subject: true,
              status: true,
              priority: true,
              category: true,
              location: true,
              createdAt: true
            }
          },
          technician: {
            select: {
              name: true,
              department: true,
              technicianProfile: {
                select: {
                  expertise: true,
                  area: true,
                  shift: true
                }
              }
            }
          }
        }
      });
      
      console.log('Recent assignments:', recentAssignments);
    } catch (error) {
      console.error('Error fetching recent assignments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recent assignments' },
        { status: 500 }
      );
    }

    console.log('Recent assignments:', JSON.stringify(recentAssignments, null, 2));

    console.log(`Found ${recentAssignments.length} recent assignments`);

      // Get monthly statistics for the last 6 months
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    interface MonthlyStats {
      month: string;
      pending: number;
      inProgress: number;
      completed: number;
    }

    // Get detailed tickets for monthly breakdown - exclude old completed tickets and CANCELLED
    const tickets = await prisma.ticket.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo
        },
        OR: [
          // Include all non-completed tickets
          { NOT: { status: 'COMPLETED' } },
          // Include completed tickets from last 7 days only
          {
            status: 'COMPLETED' as any,
            completedAt: {
              gte: sevenDaysAgo
            }
          }
        ]
      },
      select: {
        status: true,
        createdAt: true,
        priority: true,
        category: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Filter out CANCELLED in-memory
    const activeTickets = tickets.filter(t => t.status !== 'CANCELLED');
    console.log(`Found ${activeTickets.length} active tickets for the last 6 months`);

    // Initialize monthly stats
    const monthlyStats: MonthlyStats[] = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyStats.unshift({
        month: date.toLocaleString('id-ID', { month: 'short', year: 'numeric' }),
        pending: 0,
        inProgress: 0,
        completed: 0
      });
    }

    // Process tickets into monthly stats dengan status enum asli
    activeTickets.forEach(ticket => {
      const ticketMonth = new Date(ticket.createdAt).toLocaleString('id-ID', { 
        month: 'short', 
        year: 'numeric' 
      });
      const monthStat = monthlyStats.find(m => m.month === ticketMonth);
      
      if (monthStat) {
        switch (ticket.status) {
          case 'PENDING':
            monthStat.pending++;
            break;
          case 'ASSIGNED':
            monthStat.pending++;
            break;
          case 'IN_PROGRESS':
            monthStat.inProgress++;
            break;
          case 'COMPLETED':
            monthStat.completed++;
            break;
        }
      }
    });

    console.log('Monthly stats calculated:', monthlyStats);    // Format recent assignments
    const formattedAssignments = recentAssignments.map(assignment => ({
      id: assignment.id,
      ticketSubject: assignment.ticket?.subject || 'No subject',
      technicianName: assignment.technician?.name || 'Unassigned',
      technicianExpertise: assignment.technician?.technicianProfile?.expertise || 'N/A',
      technicianArea: assignment.technician?.technicianProfile?.area || 'N/A',
      status: assignment.ticket?.status || 'PENDING',
      priority: assignment.ticket?.priority || 'MEDIUM',
      category: assignment.ticket?.category || 'N/A',
      location: assignment.ticket?.location || 'N/A',
      assignedAt: assignment.assignedAt.toISOString(),
      department: assignment.technician?.department || 'N/A'
    }));

    // Format monthly stats with proper grouping
    const monthlyStatsFormatted = monthlyStats.map(stat => ({
      ...stat,
      totalTickets: stat.pending + stat.inProgress + stat.completed
    }));

    return NextResponse.json({
      currentStats: {
        pending,
        inProgress,
        completed,
        totalAssignments,
        totalTickets: pending + inProgress + completed
      },
      recentAssignments: formattedAssignments,
      monthlyStats: monthlyStatsFormatted.reverse(),
      ticketCategories: activeTickets.reduce((acc, ticket) => {
        const existing = acc.find(c => c.category === ticket.category);
        if (existing) {
          existing._count.category++;
        } else {
          acc.push({
            category: ticket.category,
            _count: { category: 1 }
          });
        }
        return acc;
      }, [] as Array<{ category: string; _count: { category: number } }>)
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Log detailed error information
    if (error instanceof Error) {
      console.error({
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined 
      },
      { status: 500 }
    );
  }
}