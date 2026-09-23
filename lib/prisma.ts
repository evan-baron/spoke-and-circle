import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const dbUrl =
	process.env.NODE_ENV === 'production' ?
		process.env.DATABASE_URL
	:	process.env.DEVELOPMENT_DATABASE_URL;

if (!dbUrl) {
	throw new Error('Database URL environment variable is not set');
}

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}

export { prisma };
