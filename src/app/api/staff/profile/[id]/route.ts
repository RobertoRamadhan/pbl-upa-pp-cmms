import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET staff profile
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: {
        id: id,
        role: 'STAFF'
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        department: true,
        role: true,
        joinDate: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Staff profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching staff profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// UPDATE staff profile
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, department } = body;

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if user exists and is a staff
    const existingUser = await prisma.user.findUnique({
      where: {
        id: id,
        role: 'STAFF'
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Staff profile not found' },
        { status: 404 }
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: id
      },
      data: {
        name,
        email,
        phone,
        department,
        updatedAt: new Date()
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        department: true,
        role: true,
        joinDate: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating staff profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}