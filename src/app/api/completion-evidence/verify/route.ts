import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { assignmentId, action, notes } = await request.json();

    if (!assignmentId || !action) {
      return NextResponse.json(
        { error: 'assignmentId dan action diperlukan' },
        { status: 400 }
      );
    }

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: 'action harus APPROVE atau REJECT' },
        { status: 400 }
      );
    }

    // Get current assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { ticket: true },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Tugas tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update verification status
    let updateData: any = {
      verificationStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      verifiedAt: new Date(),
      verifiedBy: 'supervisor', // In production, get from session/auth
    };

    // If rejecting, set status back to IN_PROGRESS for rework
    if (action === 'REJECT') {
      updateData.status = 'IN_PROGRESS';
    } else if (action === 'APPROVE') {
      // If approving, set status to COMPLETED
      updateData.status = 'COMPLETED';
    }

    // Update notes with supervisor feedback
    if (notes) {
      const existingNotes = assignment.notes || '';
      updateData.notes = existingNotes ? `${existingNotes}\n\n[Verifikasi Supervisor]\n${notes}` : `[Verifikasi Supervisor]\n${notes}`;
    }

    // Update assignment
    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: updateData,
    });

    // Update ticket status based on action
    if (action === 'REJECT' && assignment.ticket) {
      // If rejected, reopen ticket to IN_PROGRESS so technician can rework it
      await prisma.ticket.update({
        where: { id: assignment.ticketId },
        data: { status: 'IN_PROGRESS' as any },
      });
    } else if (action === 'APPROVE' && assignment.ticket) {
      // If approved, close the ticket
      await prisma.ticket.update({
        where: { id: assignment.ticketId },
        data: { status: 'COMPLETED' as any },
      });
    }

    return NextResponse.json(
      { 
        message: action === 'APPROVE' ? 'Laporan disetujui' : 'Laporan ditolak, tugas dikembalikan ke IN_PROGRESS',
        assignment: updated 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: 'Gagal memverifikasi laporan' },
      { status: 500 }
    );
  }
}
