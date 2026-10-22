import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from '@/lib/siteConfig';
import { stateSlug, US_STATES } from '@/lib/usStates';
import { getStatesWithListings } from '@/services/stateLandingService';

export const dynamic = 'force-dynamic';

export async function GET() {
	const baseUrl = getSiteUrl();
	const statesWithListings = await getStatesWithListings();

	const stateLinks = (kind: 'teams' | 'rides', basePath: string, label: string) =>
		US_STATES.filter((state) => statesWithListings[kind].includes(state.abbr)).map(
			(state) =>
				`- [${label} in ${state.name}](${baseUrl}${basePath}/${stateSlug(state)})`,
		);

	const lines = [
		`# ${SITE_NAME}`,
		'',
		`> ${SITE_DESCRIPTION}`,
		'',
		'Every listing is reviewed before it is published. Each team or ride page gives quick, at-a-glance details (location, pace, skill level, drop policy, schedule, how to join) and links out to the organizer for the rest. Coverage is United States only.',
		'',
		'## Search',
		'',
		`- [Find a group ride](${baseUrl}/group-rides): search group rides by location, distance, and discipline`,
		`- [Find a team or club](${baseUrl}/search): search cycling teams and clubs by location, riding style, and skill level`,
		'',
		'## Browse by state',
		'',
		...stateLinks('rides', '/group-rides/in', 'Group rides'),
		...stateLinks('teams', '/teams/in', 'Cycling teams and clubs'),
		'',
		'## About',
		'',
		`- [About ${SITE_NAME}](${baseUrl}/about)`,
		`- [Get started](${baseUrl}/get-started)`,
		`- [Sitemap](${baseUrl}/sitemap.xml)`,
		'',
	];

	return new Response(lines.join('\n'), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
}
