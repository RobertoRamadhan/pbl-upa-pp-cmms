import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const technician = await prisma.systemUser.findUnique({
      where: { id, role: 'TECHNICIAN' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        technicianProfile: {
          select: {
            expertise: true,
            area: true,
            shift: true
          }
        }
      }
    });

    if (!technician) {
      return NextResponse.json(
        { message: 'Technician not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(technician);
  } catch (error) {
    console.error('Error fetching technician:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, password, expertise = '', area = '', shift = '' } = body;

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { message: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if technician exists
    const technician = await prisma.systemUser.findUnique({
      where: { id }
    });

    if (!technician || technician.role !== 'TECHNICIAN') {
      return NextResponse.json(
        { message: 'Technician not found' },
        { status: 404 }
      );
    }

    // Check if email is already used by another user
    const existingUser = await prisma.systemUser.findUnique({
      where: { email }
    });

    if (existingUser && existingUser.id !== id) {
      return NextResponse.json(
        { message: 'Email already in use' },
        { status: 400 }
      );
    }

    // Update user data
    const updateData: {
      name: string;
      email: string;
      updatedAt: Date;
      password?: string;
    } = {
      name,
      email,
      updatedAt: new Date()
    };

    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update technician
    await prisma.systemUser.update({
      where: { id },
      data: updateData
    });

    // Update technician profile if provided
    if (expertise || area || shift) {
      await prisma.technicianProfile.update({
        where: { userId: id },
        data: {
          ...(expertise && { expertise }),
          ...(area && { area }),
          ...(shift && { shift })
        }
      });
    }

    // Fetch updated technician with profile
    const updatedTechnician = await prisma.systemUser.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        technicianProfile: {
          select: {
            expertise: true,
            area: true,
            shift: true
          }
        }
      }
    });

    return NextResponse.json(updatedTechnician);
  } catch (error) {
    console.error('Error updating technician:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if technician exists
    const technician = await prisma.systemUser.findUnique({
      where: { id }
    });

    if (!technician || technician.role !== 'TECHNICIAN') {
      return NextResponse.json(
        { message: 'Technician not found' },
        { status: 404 }
      );
    }

    // Delete related data first (assignments, repair logs, etc.)
    // Delete assignments assigned to this technician
    await prisma.assignment.deleteMany({
      where: { technicianId: id }
    });

    // Delete repair logs created by this technician
    await prisma.repairLog.deleteMany({
      where: { technicianId: id }
    });

    // Delete notifications for this technician
    await prisma.notification.deleteMany({
      where: { userId: id }
    });

    // Delete technician profile
    await prisma.technicianProfile.deleteMany({
      where: { userId: id }
    });

    // Finally delete the technician user
    await prisma.systemUser.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Technician deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting technician:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
