import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15+ requirement)
    const { id } = await params;
    console.log(`[ASSIGNMENT-API] Fetching assignment with ID: ${id}`);

    if (!id) {
      console.log('[ASSIGNMENT-API] No ID provided');
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        ticket: {
          select: {
            id: true,
            ticketNumber: true,
            subject: true,
            description: true,
            priority: true,
            category: true,
            createdAt: true,
            reporterId: true,
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log('[ASSIGNMENT-API] Prisma query result:', assignment ? 'Found' : 'Not found');

    if (!assignment) {
      console.log(`[ASSIGNMENT-API] Assignment not found for ID: ${id}`);
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    console.log('[ASSIGNMENT-API] Returning assignment successfully');
    return NextResponse.json(assignment);
  } catch (error) {
    console.error('[ASSIGNMENT-API] Error:', error);
    console.error('[ASSIGNMENT-API] Error message:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { 
        error: 'Failed to fetch assignment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
