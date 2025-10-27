import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connection successful');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.ticket.deleteMany();
    await prisma.technicianProfile.deleteMany();
    await prisma.systemUser.deleteMany();
    console.log('Existing data cleared');
    // Create admin user
    const adminPassword = await hash('admin123', 10);
    const admin = await prisma.systemUser.create({
      data: {
        id: 'admin-1',
        username: 'admin',
        password: adminPassword,
        role: 'ADMIN',
        name: 'Administrator',
        email: 'admin@example.com',
        department: 'IT',
        updatedAt: new Date(),
      },
    });
    console.log('Admin created:', admin);

    // Create technician user
    const techPassword = await hash('tech123', 10);
    const technician = await prisma.systemUser.create({
      data: {
        id: 'tech-1',
        username: 'technician',
        password: techPassword,
        role: 'TECHNICIAN',
        name: 'John Tech',
        email: 'tech@example.com',
        department: 'Maintenance',
        updatedAt: new Date(),
      },
    });

    // Create technician profile
    const techProfile = await prisma.technicianProfile.create({
      data: {
        id: 'techprofile-1',
        userId: technician.id,
        expertise: 'Electronics',
        area: 'Building A',
        shift: 'Morning',
      },
    });
    console.log('Technician and profile created:', { technician, techProfile });

    // Create staff user
    const staffPassword = await hash('staff123', 10);
    const staff = await prisma.systemUser.create({
      data: {
        id: 'staff-1',
        username: 'staff',
        password: staffPassword,
        role: 'STAFF',
        name: 'Jane Staff',
        email: 'staff@example.com',
        department: 'Academic',
        updatedAt: new Date(),
      },
    });
    console.log('Staff created:', staff);

    // Create supervisor user
    const supervisorPassword = await hash('supervisor123', 10);
    const supervisor = await prisma.systemUser.create({
      data: {
        id: 'supervisor-1',
        username: 'supervisor',
        password: supervisorPassword,
        role: 'SUPERVISOR',
        name: 'Kepala UPPA',
        email: 'supervisor@example.com',
        department: 'UPPA',
        updatedAt: new Date(),
      },
    });
    console.log('Supervisor created:', supervisor);

    // Create sample ticket
    const ticket = await prisma.ticket.create({
      data: {
        id: 'ticket-1',
        ticketNumber: 'TIC001',
        category: 'Hardware',
        subject: 'Printer not working',
        description: 'The printer in room 101 is not responding',
        location: 'Room 101',
        priority: 'MEDIUM',
        reporterId: staff.id,
        updatedAt: new Date(),
      },
    });
    console.log('Sample ticket created:', ticket);

  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });