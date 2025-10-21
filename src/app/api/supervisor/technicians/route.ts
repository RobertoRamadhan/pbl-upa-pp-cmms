import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';
import { user_role } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const technicians = await prisma.user.findMany({
      where: {
        role: "TECHNICIAN" as user_role,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        department: true,
        technicianprofile: {
          select: {
            expertise: true,
            area: true,
            shift: true,
            rating: true,
            totalTasks: true
          }
        },
        assignment_assignment_technicianIdTouser: {
          where: {
            status: {
              in: ["PENDING", "IN_PROGRESS"]
            }
          },
          select: {
            status: true
          }
        }
      }
    });

    // Transform the data to include availability status
    const techniciansWithStatus = technicians.map((tech) => ({
      id: tech.id,
      name: tech.name,
      email: tech.email,
      phoneNumber: tech.phone,
      department: tech.department,
      expertise: tech.technicianprofile?.expertise ?? null,
      area: tech.technicianprofile?.area ?? null,
      shift: tech.technicianprofile?.shift ?? null,
      rating: tech.technicianprofile?.rating ?? 0,
      totalTasks: tech.technicianprofile?.totalTasks ?? 0,
      status: tech.assignment_assignment_technicianIdTouser.length > 0 ? 'Busy' : 'Available' as const
    }));

    return NextResponse.json(techniciansWithStatus);
  } catch (error) {
    console.error('Error fetching technicians:', error);
    return NextResponse.json(
      { error: 'Failed to fetch technicians' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const technician = await prisma.user.create({
      data: {
        ...data,
        role: "TECHNICIAN"
      }
    });

    return NextResponse.json(technician);
  } catch (error) {
    console.error('Error creating technician:', error);
    return NextResponse.json(
      { error: 'Failed to create technician' },
      { status: 500 }
    );
  }
}