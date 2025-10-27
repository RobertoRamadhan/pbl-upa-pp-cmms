import { PrismaClient } from '@prisma/client';

const prismaGlobal = global as typeof global & {
  prisma?: PrismaClient;
};

// Create Prisma Client with connection handling
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: ['query', 'error', 'warn'],
    errorFormat: 'pretty'
  });

  // Test the connection
  client.$connect()
    .then(() => {
      console.log('Successfully connected to database');
    })
    .catch((error) => {
      console.error('Failed to connect to database:', {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        databaseUrl: process.env.DATABASE_URL?.replace(/:.*@/, ':****@')
      });
    });

  return client;
};

// Initialize the Prisma Client
export const prisma = prismaGlobal.prisma ?? createPrismaClient();