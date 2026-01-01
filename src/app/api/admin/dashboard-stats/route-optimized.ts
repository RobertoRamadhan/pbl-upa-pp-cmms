import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

export const revalidate = 60; // Cache for 60 seconds to reduce database hits

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

    // Calculate date cutoffs
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // ✅ PARALLEL QUERIES - Execute all queries in parallel for better performance
    const [ticketStats, assignmentCount, recentAssignments, ticketsForMonthly] = await Promise.all([
      // Query 1: Ticket counts by status
      prisma.ticket.groupBy({
        by: ['status'],
        where: {
          OR: [
            { NOT: { status: 'COMPLETED' } },
            { status: 'COMPLETED' as any, completedAt: { gte: sevenDaysAgo } }
          ]
        },
        _count: { status: true }
      }),
      
      // Query 2: Assignment count
      prisma.assignment.count({
        where: { NOT: { status: 'REJECTED' } }
      }),
      
      // Query 3: Recent assignments (optimized with select instead of include)
      prisma.assignment.findMany({
        take: 5,
        orderBy: { assignedAt: 'desc' },
        select: {
          id: true,
          assignedAt: true,
          ticket: {
            select: {
              subject: true,
              status: true,
              priority: true,
              category: true,
              location: true
            }
          },
          technician: {
            select: {
              name: true,
              department: true,
              technicianProfile: {
                select: {
                  expertise: true,
                  area: true
                }
              }
            }
          }
        }
      }),
      
      // Query 4: Tickets for monthly stats (one query instead of separate query)
      prisma.ticket.findMany({
        where: {
          createdAt: { gte: sixMonthsAgo },
          OR: [
            { NOT: { status: 'COMPLETED' } },
            { status: 'COMPLETED' as any, completedAt: { gte: sevenDaysAgo } }
          ]
        },
        select: {
          status: true,
          createdAt: true,
          category: true
        },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    // Calculate counts
    const pending = ticketStats.find(stat => stat.status === 'PENDING')?._count.status || 0;
    const inProgress = ticketStats.find(stat => stat.status === 'IN_PROGRESS')?._count.status || 0;
    const completed = ticketStats.find(stat => stat.status === 'COMPLETED')?._count.status || 0;
    
    // Format recent assignments
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

    // Calculate monthly stats
    interface MonthlyStats {
      month: string;
      pending: number;
      inProgress: number;
      completed: number;
    }
    
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

    // Process tickets into monthly stats
    ticketsForMonthly.forEach(ticket => {
      const ticketMonth = new Date(ticket.createdAt).toLocaleString('id-ID', { 
        month: 'short', 
        year: 'numeric' 
      });
      const monthStat = monthlyStats.find(m => m.month === ticketMonth);
      
      if (monthStat) {
        if (ticket.status === 'PENDING' || ticket.status === 'ASSIGNED') {
          monthStat.pending++;
        } else if (ticket.status === 'IN_PROGRESS') {
          monthStat.inProgress++;
        } else if (ticket.status === 'COMPLETED') {
          monthStat.completed++;
        }
      }
    });

    // Get ticket categories from already-fetched data
    const ticketCategories = ticketsForMonthly.reduce((acc, ticket) => {
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
    }, [] as Array<{ category: string; _count: { category: number } }>);

    // Return formatted response with caching headers
    const response = NextResponse.json({
      currentStats: {
        pending,
        inProgress,
        completed,
        totalAssignments: assignmentCount,
        totalTickets: pending + inProgress + completed
      },
      recentAssignments: formattedAssignments,
      monthlyStats: monthlyStats.reverse(),
      ticketCategories
    });

    // Set caching headers to reduce repeated database hits
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
