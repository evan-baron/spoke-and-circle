import { revalidateTag } from 'next/cache';

export const TEAMS_TAG = 'teams';
export const DUPLICATE_CANDIDATES_TAG = 'duplicate-candidates';

export const teamTag = (id: string) => `team:${id}`;

export function revalidateTeams(...ids: string[]): void {
	revalidateTag(TEAMS_TAG);
	revalidateTag(DUPLICATE_CANDIDATES_TAG);
	for (const id of ids) revalidateTag(teamTag(id));
}

export function revalidateDuplicateCandidates(): void {
	revalidateTag(DUPLICATE_CANDIDATES_TAG);
}
