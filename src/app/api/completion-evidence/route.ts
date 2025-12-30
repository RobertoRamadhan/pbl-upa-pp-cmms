import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';

    // Ambil semua assignment dengan verificationStatus PENDING (waiting for approval)
    const assignments = await prisma.assignment.findMany({
      where: {
        status: 'COMPLETED', // Assignment status, bukan ticket
        completionNotes: { not: null },
      },
      include: {
        ticket: true,
        technician: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Filter berdasarkan verification status (bukan ticket status)
    const evidences = assignments
      .filter((assignment) => {
        if (status === 'PENDING') {
          return assignment.verificationStatus === 'PENDING';
        } else if (status === 'APPROVED') {
          return assignment.verificationStatus === 'APPROVED';
        } else if (status === 'REJECTED') {
          return assignment.verificationStatus === 'REJECTED';
        }
        return true;
      })
      .map((assignment) => {
        let images: string[] = [];
        try {
          if (assignment.completionNotes) {
            const parsed = JSON.parse(assignment.completionNotes);
            images = parsed.images || [];
          }
        } catch {
          // Jika bukan JSON, ignore
        }

        return {
          id: assignment.id,
          ticketNumber: assignment.ticket.ticketNumber,
          subject: assignment.ticket.subject,
          technicianName: assignment.technician.name,
          images,
          verificationStatus: assignment.verificationStatus,
          completedAt: assignment.endTime,
        };
      });

    return NextResponse.json(evidences);
  } catch (error) {
    console.error('Error fetching completion evidence:', error);
    return NextResponse.json(
      { error: 'Failed to fetch completion evidence' },
      { status: 500 }
    );
  }
}
