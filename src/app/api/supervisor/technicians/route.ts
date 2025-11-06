import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { user_role, assignment_status } from "@prisma/client";

interface TechnicianData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  department: string | null;
  technicianProfile: {
    expertise: string;
    area: string;
    shift: string;
    rating: number;
    totalTasks: number;
  } | null;
  assignedToMe: {
    status: assignment_status;
  }[];
}

export async function GET() {
  try {
    const technicians = await prisma.systemUser.findMany({
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
        technicianProfile: {
          select: {
            expertise: true,
            area: true,
            shift: true,
            rating: true,
            totalTasks: true,
          },
        },
        assignedToMe: {
          where: {
            status: {
              in: ["PENDING", "IN_PROGRESS"],
            },
          },
          select: {
            status: true,
          },
        },
      },
    });

    // Transform the data to include availability status
    const techniciansWithStatus = technicians.map((tech: TechnicianData) => ({
      id: tech.id,
      name: tech.name,
      email: tech.email,
      phoneNumber: tech.phone,
      department: tech.department,
      expertise: tech.technicianProfile?.expertise ?? null,
      area: tech.technicianProfile?.area ?? null,
      shift: tech.technicianProfile?.shift ?? null,
      rating: tech.technicianProfile?.rating ?? 0,
      totalTasks: tech.technicianProfile?.totalTasks ?? 0,
      status: tech.assignedToMe.length > 0 ? 'Busy' : 'Available' as const
    }));

    return NextResponse.json(techniciansWithStatus);
  } catch (error) {
    console.error("Error fetching technicians:", error);
    return NextResponse.json(
      { error: "Failed to fetch technicians" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const technician = await prisma.systemUser.create({
      data: {
        ...data,
        role: "TECHNICIAN"
      }
    });

    return NextResponse.json(technician);
  } catch (error) {
    console.error("Error creating technician:", error);
    return NextResponse.json(
      { error: "Failed to create technician" },
      { status: 500 }
    );
  }
}
