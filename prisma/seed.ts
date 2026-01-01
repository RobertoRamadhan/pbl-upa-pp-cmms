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
    // Delete in correct order based on foreign key constraints
    await prisma.notification.deleteMany();
    await prisma.material.deleteMany();
    await prisma.repairLog.deleteMany();
    await prisma.maintenanceHistory.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.technicianProfile.deleteMany();
    await prisma.systemUser.deleteMany();
    await prisma.asset.deleteMany();
    console.log('Existing data cleared');
    // Create admin user dengan password yang aman
    const adminPassword = await hash('Admin@CMMS2024Secure!', 10);
    const admin = await prisma.systemUser.create({
      data: {
        id: 'admin-1',
        username: 'admin',
        password: adminPassword,
        role: 'ADMIN',
        name: 'Administrator CMMS',
        email: 'obetkaneki12@gmail.com',
        department: 'Dosen',
        updatedAt: new Date(),
      },
    });
    console.log('Admin created:', admin);

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
        department: 'Laboran',
        updatedAt: new Date(),
      },
    });
    console.log('Supervisor created:', supervisor);
    
    // TODO: Uncomment after migration is applied to production database
    // console.log('\n📋 Creating ticket categories...');
    // const defaultCategories = [
    //   { name: 'Komputer/Laptop', description: 'Masalah dengan komputer atau laptop' },
    //   { name: 'Printer', description: 'Masalah dengan printer atau mesin pencetak' },
    //   { name: 'Jaringan', description: 'Masalah konektivitas jaringan atau WiFi' },
    //   { name: 'AC', description: 'Perbaikan dan perawatan sistem AC' },
    //   { name: 'Listrik', description: 'Perbaikan sistem kelistrikan' },
    //   { name: 'Furniture', description: 'Perbaikan mebel dan peralatan kantor' },
    //   { name: 'Lainnya', description: 'Kategori lainnya yang tidak tercantum' }
    // ];

    // for (const cat of defaultCategories) {
    //   try {
    //     await prisma.ticketCategory.upsert({
    //       where: { name: cat.name },
    //       update: {
    //         description: cat.description,
    //         isActive: true
    //       },
    //       create: {
    //         name: cat.name,
    //         description: cat.description,
    //         isActive: true
    //       }
    //     });
    //     console.log(`✓ Category created: ${cat.name}`);
    //   } catch (error) {
    //     console.log(`ℹ Category already exists: ${cat.name}`);
    //   }
    // }
    
    console.log('\n✅ Database seeding complete!');
    console.log('📝 Test credentials:');
    console.log('   Admin: username "admin" / password "Admin@CMMS2024Secure!" (email: obetkaneki12@gmail.com)');
    console.log('   Supervisor: username "supervisor" / password "supervisor123"');
    console.log('\n💡 Create staff and technician users from Admin Dashboard or via registration tokens');

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