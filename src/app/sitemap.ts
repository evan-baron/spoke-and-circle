import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { getSiteUrl } from '@/lib/siteConfig';

export const dynamic = 'force-dynamic';

const MAX_TEAM_URLS = 45000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = getSiteUrl();

	const teams = await prisma.team.findMany({
		where: { status: 'Approved' },
		select: { id: true, updatedAt: true },
		orderBy: { updatedAt: 'desc' },
		take: MAX_TEAM_URLS,
	});

	return [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 1,
		},
		{
			url: `${baseUrl}/search`,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 0.9,
		},
		{
			url: `${baseUrl}/get-started`,
			changeFrequency: 'monthly',
			priority: 0.6,
		},
		{
			url: `${baseUrl}/teams/new`,
			changeFrequency: 'monthly',
			priority: 0.6,
		},
		{
			url: `${baseUrl}/contact`,
			changeFrequency: 'yearly',
			priority: 0.4,
		},
		...teams.map((team) => ({
			url: `${baseUrl}/teams/${team.id}`,
			lastModified: team.updatedAt,
			changeFrequency: 'weekly' as const,
			priority: 0.7,
		})),
	];
}
