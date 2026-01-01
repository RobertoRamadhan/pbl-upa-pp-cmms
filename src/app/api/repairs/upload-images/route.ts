import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  let assignmentId: string | null = null;
  let images: File[] = [];

  try {
    const formData = await request.formData();
    assignmentId = formData.get('assignmentId') as string;
    images = formData.getAll('images') as File[];

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID diperlukan' },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'Setidaknya satu gambar diperlukan' },
        { status: 400 }
      );
    }

    const existingAssignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { ticket: true },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: 'Assignment tidak ditemukan' },
        { status: 404 }
      );
    }

    // Convert gambar ke base64
    const uploadedImages: string[] = [];
    for (const image of images) {
      try {
        const buffer = await image.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const dataUrl = `data:${image.type};base64,${base64}`;
        uploadedImages.push(dataUrl);
      } catch (imageError) {
        throw imageError;
      }
    }

    // Update assignment dengan gambar - set startTime jika belum ada
    const now = new Date();
    
    // Jika needsVerification = false, langsung mark as COMPLETED
    // Jika needsVerification = true, tetap PENDING, tunggu supervisor approval
    const ticketStatus = existingAssignment.needsVerification ? 'IN_PROGRESS' : 'COMPLETED';
    
    const assignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        completionNotes: JSON.stringify({
          images: uploadedImages,
          uploadedAt: now.toISOString(),
        }),
        status: 'COMPLETED',
        startTime: {
          // Jika startTime belum ada, set ke sekarang (waktu upload)
          // Jika sudah ada, gunakan yang lama
          set: await prisma.assignment.findUnique({
            where: { id: assignmentId },
            select: { startTime: true },
          }).then(a => a?.startTime || now)
        },
        endTime: now,
      },
      include: {
        ticket: true,
        technician: true,
      },
    });
    
    // Update ticket status
    await prisma.ticket.update({
      where: { id: existingAssignment.ticket.id },
      data: { status: ticketStatus as any },
    });

    // Buat notifikasi untuk admin dan supervisor HANYA jika needsVerification=true
    if (existingAssignment.needsVerification) {
      const adminAndSupervisors = await prisma.systemUser.findMany({
        where: {
          role: { in: ['ADMIN', 'SUPERVISOR'] },
          isActive: true,
        },
        select: {
          id: true,
          username: true,
        },
      });

      if (adminAndSupervisors.length > 0) {
        for (const user of adminAndSupervisors) {
          try {
            await prisma.notification.create({
              data: {
                userId: user.id,
                message: `Tugas ${assignment.ticket.ticketNumber} perlu diverifikasi oleh ${assignment.technician.name}`,
                type: 'INFO',
              },
            });
          } catch (notifError) {
            // Silently continue if notification fails
          }
        }
      }
    }
    
    return NextResponse.json(
      {
        message: 'Gambar berhasil diunggah',
        urls: uploadedImages,
        assignment: {
          id: assignment.id,
          ticketNumber: assignment.ticket.ticketNumber,
          technicianName: assignment.technician.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        error: 'Gagal mengunggah gambar',
        details: errorMessage,
        assignmentId: assignmentId,
        imagesCount: images.length,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
      },
      { status: 500 }
    );
  }
}
