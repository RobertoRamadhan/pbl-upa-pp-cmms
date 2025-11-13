import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const assignmentId = params.id;
    const { note, technicianId } = await request.json();

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });

    const techId = technicianId || assignment.technicianId;

    const repairLog = await prisma.repairLog.create({
      data: {
        id: randomUUID(),
        assignment: { connect: { id: assignmentId } },
        user: { connect: { id: techId } },
        description: note || '',
        action: 'NOTE',
        status: 'ONGOING',
        timeSpent: 0,
      },
      include: { user: true },
    });

    return NextResponse.json(repairLog);
  } catch (error) {
    console.error('Error creating repair note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
