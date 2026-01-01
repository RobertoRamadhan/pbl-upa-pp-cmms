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
    
    // Create ticket categories based on UPA maintenance structure
    console.log('\n📋 Creating ticket categories...');
    const defaultCategories = [
      {
        name: 'Kerusakan Gedung (Fisik Bangunan)',
        description: 'Bangunan & Struktur, Pintu & Jendela, Fasilitas Sanitasi'
      },
      {
        name: 'Bangunan & Struktur',
        description: 'Dinding retak/rusak, atap bocor/rusak, lantai rusak, plafon jebol'
      },
      {
        name: 'Pintu & Jendela',
        description: 'Engsel rusak, kunci macet, kaca pecah, kusen lapuk'
      },
      {
        name: 'Fasilitas Sanitasi',
        description: 'Toilet mampet/rusak, keran bocor, instalasi air rusak'
      },
      {
        name: 'Sistem Elektrikal & Mekanikal',
        description: 'Instalasi listrik, sistem air, sistem pendingin'
      },
      {
        name: 'Instalasi Listrik',
        description: 'Lampu mati, stopkontak tidak berfungsi, korsleting, gangguan MCB'
      },
      {
        name: 'Sistem Air',
        description: 'Pipa bocor, pompa air rusak, instalasi air panas/dingin bermasalah'
      },
      {
        name: 'Sistem Pendingin (AC)',
        description: 'AC tidak dingin, AC bocor, AC mati'
      },
      {
        name: 'Peralatan & Fasilitas Pendidikan/Umum',
        description: 'Peralatan IT, laboratorium, meubel, dan fasilitas umum'
      },
      {
        name: 'Peralatan Komputer & IT',
        description: 'Komputer error, proyektor mati/bergaris, speaker tidak bersuara, printer rusak'
      },
      {
        name: 'Peralatan Laboratorium',
        description: 'Kerusakan alat praktikum sesuai lingkup UPA'
      },
      {
        name: 'Meubel & Furnitur',
        description: 'Kursi patah, meja rusak, lemari tidak bisa ditutup'
      },
      {
        name: 'Fasilitas Umum',
        description: 'Pagar rusak, gerbang bermasalah, papan pengumuman pecah'
      },
      {
        name: 'Pemeliharaan Rutin',
        description: 'Pemeriksaan berkala dan perawatan preventif untuk semua fasilitas'
      }
    ];

    for (const cat of defaultCategories) {
      try {
        await prisma.ticketCategory.upsert({
          where: { name: cat.name },
          update: {
            description: cat.description,
            isActive: true
          },
          create: {
            name: cat.name,
            description: cat.description,
            isActive: true
          }
        });
        console.log(`✓ Category created: ${cat.name}`);
      } catch (error) {
        console.log(`ℹ Category already exists: ${cat.name}`);
      }
    }
    
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