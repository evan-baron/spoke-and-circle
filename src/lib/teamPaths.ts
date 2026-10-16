export type TeamRoute = 'teams' | 'group-rides';

interface TeamPathInput {
	id: string;
	type: string;
}

export function teamRoute(type: string): TeamRoute {
	return type === 'Group Ride' ? 'group-rides' : 'teams';
}

export function teamPath(team: TeamPathInput): string {
	return `/${teamRoute(team.type)}/${encodeURIComponent(team.id)}`;
}
