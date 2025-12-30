import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignmentId, action, verifierId, reason } = body;

    if (!assignmentId || !action || !verifierId) {
      return NextResponse.json(
        { error: 'Parameter tidak lengkap' },
        { status: 400 }
      );
    }

    // Validasi action hanya APPROVED atau REJECTED
    if (!['APPROVED', 'REJECTED'].includes(action)) {
      return NextResponse.json(
        { error: 'Action harus APPROVED atau REJECTED' },
        { status: 400 }
      );
    }

    // Update assignment verification status
    const assignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        notes: `Verifikasi: ${action === 'APPROVED' ? 'Disetujui' : 'Ditolak'}. Alasan: ${reason || 'Silakan hubungi supervisor'}`,
        updatedAt: new Date(),
      },
      include: {
        ticket: true,
        technician: true,
      },
    });

    // Jika approved, update ticket status menjadi COMPLETED
    if (action === 'APPROVED') {
      await prisma.ticket.update({
        where: { id: assignment.ticketId },
        data: {
          status: 'COMPLETED' as any,
          completedAt: new Date(),
        },
      });

      // Notifikasi teknisi bahwa pekerjaan sudah disetujui
      await prisma.notification.create({
        data: {
          userId: assignment.technicianId,
          message: `Pekerjaan Anda untuk tiket ${assignment.ticket.ticketNumber} telah disetujui oleh verifikator`,
          type: 'SUCCESS',
        },
      });
    } else {
      // Jika rejected, ubah status assignment kembali ke IN_PROGRESS agar bisa dikerjakan ulang
      await prisma.assignment.update({
        where: { id: assignmentId },
        data: {
          status: 'IN_PROGRESS' as any,
        },
      });

      // Notifikasi teknisi untuk revisi
      await prisma.notification.create({
        data: {
          userId: assignment.technicianId,
          message: `Pekerjaan Anda untuk tiket ${assignment.ticket.ticketNumber} perlu diperbaiki. Alasan: ${reason || 'Silakan hubungi supervisor'}`,
          type: 'WARNING',
        },
      });
    }

    // Notifikasi reporter
    await prisma.notification.create({
      data: {
        userId: assignment.ticket.reporterId,
        message: `Tiket Anda ${assignment.ticket.ticketNumber} ${
          action === 'APPROVED' ? 'telah selesai dan disetujui' : 'memerlukan perbaikan lebih lanjut'
        }`,
        type: action === 'APPROVED' ? 'SUCCESS' : 'INFO',
      },
    });

    return NextResponse.json({
      message: `Verifikasi berhasil - Status: ${action}`,
      assignment,
    });
  } catch (error) {
    console.error('Error verifying completion:', error);
    return NextResponse.json(
      { error: 'Gagal memverifikasi penyelesaian' },
      { status: 500 }
    );
  }
}
