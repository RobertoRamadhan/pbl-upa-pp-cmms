import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  let assignmentId: string | null = null;
  let images: File[] = [];

  try {
    console.log('[UPLOAD-IMAGES] Request received');
    
    const formData = await request.formData();
    assignmentId = formData.get('assignmentId') as string;
    images = formData.getAll('images') as File[];

    console.log(`[UPLOAD-IMAGES] assignmentId: ${assignmentId}, images count: ${images.length}`);

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

    console.log(`[UPLOAD-IMAGES] Verifying assignment exists with ID: ${assignmentId}`);
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
        console.log(`[UPLOAD-IMAGES] Processing image: ${image.name}, type: ${image.type}, size: ${image.size}`);
        const buffer = await image.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const dataUrl = `data:${image.type};base64,${base64}`;
        uploadedImages.push(dataUrl);
        console.log(`[UPLOAD-IMAGES] Image processed successfully`);
      } catch (imageError) {
        console.error(`[UPLOAD-IMAGES] Error processing image ${image.name}:`, imageError);
        throw imageError;
      }
    }

    console.log(`[UPLOAD-IMAGES] Base64 conversion complete, ${uploadedImages.length} images ready`);

    // Update assignment dengan gambar - set startTime jika belum ada
    console.log(`[UPLOAD-IMAGES] Updating assignment with completed images`);
    
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
    
    console.log('[UPLOAD-IMAGES] Assignment updated successfully');

    // Buat notifikasi untuk admin dan supervisor HANYA jika needsVerification=true
    if (existingAssignment.needsVerification) {
      console.log('[UPLOAD-IMAGES] Finding admin and supervisor users');
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
      
      console.log(`[UPLOAD-IMAGES] Found ${adminAndSupervisors.length} admin/supervisor users`);

      if (adminAndSupervisors.length > 0) {
        for (const user of adminAndSupervisors) {
          try {
            console.log(`[UPLOAD-IMAGES] Creating notification for user: ${user.id}`);
            await prisma.notification.create({
              data: {
                userId: user.id,
                message: `Tugas ${assignment.ticket.ticketNumber} perlu diverifikasi oleh ${assignment.technician.name}`,
                type: 'INFO',
              },
            });
          } catch (notifError) {
            console.error(`[UPLOAD-IMAGES] Error creating notification for ${user.id}:`, notifError);
          }
        }
      }
    } else {
      console.log('[UPLOAD-IMAGES] No supervisor verification needed, ticket auto-closed');
    }

    console.log('[UPLOAD-IMAGES] All notifications created successfully');
    
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
    console.error('[UPLOAD-IMAGES] ERROR:', error);
    if (error instanceof Error) {
      console.error('[UPLOAD-IMAGES] ERROR Message:', error.message);
      console.error('[UPLOAD-IMAGES] ERROR Stack:', error.stack);
    }

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
