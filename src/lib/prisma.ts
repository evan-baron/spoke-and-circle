import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

const dbUrl =
	process.env.NODE_ENV === 'development' ?
		process.env.DEVELOPMENT_DATABASE_URL
	:	process.env.DATABASE_URL;

if (!dbUrl) {
	throw new Error('DATABASE_URL environment variable is not set');
}

function createPrismaClient() {
	const adapter = new PrismaPg({ connectionString: dbUrl });
	return new PrismaClient({
		adapter,
		omit: { team: { searchText: true } },
	});
}

const globalForPrisma = globalThis as unknown as {
	prisma: ReturnType<typeof createPrismaClient> | undefined;
};

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV === 'development') {
	globalForPrisma.prisma = prisma;
}

export { prisma };
