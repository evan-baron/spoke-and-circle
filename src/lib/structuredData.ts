import { expandRide, fromDayNumber, toDayNumber } from '@/lib/rideSchedule';
import { getSiteUrl } from '@/lib/siteConfig';
import { teamPath } from '@/lib/teamPaths';
import type { Ride, Team } from '@/lib/types';

const NEXT_OCCURRENCE_WINDOW_DAYS = 120;

const REPEAT_FREQUENCY = {
	weekly: 'P1W',
	biweekly: 'P2W',
	monthly: 'P1M',
} as const;

const MONTH_WEEK = { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, Last: -1 } as const;

function teamUrl(team: Team): string {
	return `${getSiteUrl()}${teamPath(team)}`;
}

function teamSameAs(team: Team): string[] {
	return [team.website, team.social.instagramLink, team.social.facebookLink].filter(
		(link): link is string => Boolean(link),
	);
}

function nextOccurrence(ride: Ride): string | null {
	const today = new Date().toISOString().slice(0, 10);
	const end = fromDayNumber(toDayNumber(today) + NEXT_OCCURRENCE_WINDOW_DAYS);
	const [next] = expandRide(ride, today, end);
	return next ?? ride.startDate ?? null;
}

function rideSchedule(ride: Ride, timeZone?: string) {
	return {
		'@type': 'Schedule',
		repeatFrequency: REPEAT_FREQUENCY[ride.pattern],
		byDay: ride.days.map((day) => `https://schema.org/${day}`),
		...(ride.pattern === 'monthly' && ride.ordinals?.length ?
			{ byMonthWeek: ride.ordinals.map((ordinal) => MONTH_WEEK[ordinal]) }
		:	{}),
		...(ride.startTime ? { startTime: ride.startTime } : {}),
		...(timeZone ? { scheduleTimezone: timeZone } : {}),
	};
}

export function buildTeamJsonLd(team: Team) {
	const sameAs = teamSameAs(team);
	return {
		'@context': 'https://schema.org',
		'@type': 'SportsOrganization',
		name: team.name,
		sport: 'Cycling',
		url: teamUrl(team),
		description: team.missionStatement,
		location: { '@type': 'Place', name: team.location },
		...(team.additionalLocations?.length ?
			{ areaServed: [team.location, ...team.additionalLocations] }
		:	{}),
		...(team.founded > 0 ? { foundingDate: String(team.founded) } : {}),
		...(sameAs.length > 0 ? { sameAs } : {}),
	};
}

export function buildRideEventJsonLd(team: Team) {
	const { ride } = team;
	if (!ride) return buildTeamJsonLd(team);

	const startDate = nextOccurrence(ride);
	const description =
		team.missionStatement ??
		`${team.pace} ${team.dropPolicy.toLowerCase()} group ride in ${team.location}.`;
	const sameAs = teamSameAs(team);

	return {
		'@context': 'https://schema.org',
		'@type': 'SportsEvent',
		name: team.name,
		sport: 'Cycling',
		url: teamUrl(team),
		description,
		eventStatus: 'https://schema.org/EventScheduled',
		eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
		location: {
			'@type': 'Place',
			name: team.homeBase ?? team.location,
			address: team.location,
		},
		organizer: {
			'@type': 'Organization',
			name: team.affiliation ?? team.name,
			url: teamUrl(team),
		},
		eventSchedule: rideSchedule(ride, team.timeZone),
		...(startDate ?
			{ startDate: ride.startTime ? `${startDate}T${ride.startTime}` : startDate }
		:	{}),
		...(sameAs.length > 0 ? { sameAs } : {}),
	};
}

export function buildItemListJsonLd(name: string, teams: Team[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name,
		numberOfItems: teams.length,
		itemListElement: teams.map((team, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: team.name,
			url: teamUrl(team),
		})),
	};
}

export function buildBreadcrumbJsonLd(crumbs: { name: string; path: string }[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: crumbs.map((crumb, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: crumb.name,
			item: `${getSiteUrl()}${crumb.path}`,
		})),
	};
}
