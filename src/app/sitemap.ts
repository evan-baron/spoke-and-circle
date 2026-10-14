import type { MetadataRoute } from 'next';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getSiteUrl } from '@/lib/siteConfig';
import { TEAMS_TAG } from '@/lib/teamCache';

export const dynamic = 'force-dynamic';

const MAX_TEAM_URLS = 45000;
const SITEMAP_CACHE_SECONDS = 3600;

const getSitemapTeams = unstable_cache(
	async () => {
		const teams = await prisma.team.findMany({
			where: { status: 'Approved' },
			select: { id: true, updatedAt: true },
			orderBy: { updatedAt: 'desc' },
			take: MAX_TEAM_URLS,
		});
		return teams.map((team) => ({
			id: team.id,
			updatedAt: team.updatedAt.toISOString(),
		}));
	},
	['sitemap-teams'],
	{ tags: [TEAMS_TAG], revalidate: SITEMAP_CACHE_SECONDS },
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = getSiteUrl();

	const teams = await getSitemapTeams();

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
			url: `${baseUrl}/about`,
			changeFrequency: 'yearly',
			priority: 0.5,
		},
		{
			url: `${baseUrl}/contact`,
			changeFrequency: 'yearly',
			priority: 0.4,
		},
		{
			url: `${baseUrl}/feedback`,
			changeFrequency: 'yearly',
			priority: 0.3,
		},
		{
			url: `${baseUrl}/privacy`,
			changeFrequency: 'yearly',
			priority: 0.2,
		},
		{
			url: `${baseUrl}/terms`,
			changeFrequency: 'yearly',
			priority: 0.2,
		},
		...teams.map((team) => ({
			url: `${baseUrl}/teams/${team.id}`,
			lastModified: new Date(team.updatedAt),
			changeFrequency: 'weekly' as const,
			priority: 0.7,
		})),
	];
}
