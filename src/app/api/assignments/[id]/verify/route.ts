import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action, notes } = await request.json();
    const assignmentId = params.id;

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID diperlukan' },
        { status: 400 }
      );
    }

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: 'Action harus APPROVE atau REJECT' },
        { status: 400 }
      );
    }

    // Get assignment with relations
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { ticket: true, technician: true },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update assignment based on action
    let updateData: Record<string, unknown> = {};

    if (action === 'APPROVE') {
      updateData = {
        notes: `Verifikasi: Disetujui. Catatan: ${notes || 'Pekerjaan sesuai standar'}`,
        verificationStatus: 'APPROVED',
      };
    } else if (action === 'REJECT') {
      // Jika reject, set status kembali ke IN_PROGRESS agar teknisi bisa perbaiki
      updateData = {
        notes: `Verifikasi: Ditolak. Catatan: ${notes || 'Perlu perbaikan'}`,
        status: 'IN_PROGRESS', // Reset ke IN_PROGRESS untuk perbaikan
        verificationStatus: 'REJECTED',
      };
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: updateData,
      include: { ticket: true, technician: true },
    });

    // Update ticket status
    if (action === 'APPROVE') {
      await prisma.ticket.update({
        where: { id: assignment.ticketId },
        data: { status: 'COMPLETED' },
      });
    }

    // Create notification untuk teknisi
    if (action === 'REJECT') {
      await prisma.notification.create({
        data: {
          userId: assignment.technicianId,
          message: `Pekerjaan Anda pada tiket ${assignment.ticket.ticketNumber} perlu perbaikan. Catatan: ${notes || 'Perlu perbaikan'}`,
          type: 'WARNING',
        },
      });
    }

    return NextResponse.json({
      message: `Pekerjaan ${action === 'APPROVE' ? 'disetujui' : 'ditolak'}`,
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error('Error verifying assignment:', error);
    return NextResponse.json(
      { error: 'Gagal melakukan verifikasi' },
      { status: 500 }
    );
  }
}
