import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const technicians = await prisma.user.findMany({
      where: {
        role: 'TECHNICIAN'
      },
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

    return NextResponse.json(technicians);
  } catch (error) {
    console.error('Error fetching technicians:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, expertise = '', area = '', shift = '' } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = randomUUID();
    const username = email.split('@')[0]; // Create username from email

    // Create new technician with profile
    const newTechnician = await prisma.user.create({
      data: {
        id: userId,
        name,
        email,
        username,
        password: hashedPassword,
        role: 'TECHNICIAN',
        updatedAt: new Date(),
        technicianProfile: {
          create: {
            id: randomUUID(),
            expertise,
            area,
            shift
          }
        }
      },
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

    return NextResponse.json(newTechnician, { status: 201 });
  } catch (error) {
    console.error('Error creating technician:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}