import { NextResponse } from 'next/server';
import { z } from 'zod';
import { jsonValidationError, withAuth } from '@/lib/api';
import { prisma } from '@/lib/prisma';

const querySchema = z.object({
	q: z
		.string()
		.trim()
		.min(2, 'Search must be at least 2 characters')
		.max(100, 'Search must be less than 100 characters'),
});

export const GET = withAuth(
	{ rateLimit: 'admin-write', role: 'admin' },
	async (request) => {
		const parsed = querySchema.safeParse({
			q: request.nextUrl.searchParams.get('q') ?? '',
		});
		if (!parsed.success) return jsonValidationError(parsed.error);

		const users = await prisma.user.findMany({
			where: {
				active: true,
				email: { contains: parsed.data.q, mode: 'insensitive' },
			},
			orderBy: { email: 'asc' },
			take: 8,
			select: { id: true, firstName: true, lastName: true, email: true },
		});

		return NextResponse.json({ success: true, users });
	},
);
