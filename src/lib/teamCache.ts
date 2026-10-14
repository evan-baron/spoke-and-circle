import { revalidateTag } from 'next/cache';

export const TEAMS_TAG = 'teams';

export const teamTag = (id: string) => `team:${id}`;

export function revalidateTeams(...ids: string[]): void {
	revalidateTag(TEAMS_TAG);
	for (const id of ids) revalidateTag(teamTag(id));
}
