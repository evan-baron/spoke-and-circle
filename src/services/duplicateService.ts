import { unstable_cache } from 'next/cache';
import { clubType } from '@/lib/enums';
import { prisma } from '@/lib/prisma';
import { DUPLICATE_CANDIDATES_TAG } from '@/lib/teamCache';
import {
	DUPLICATE_SIGNAL_LABELS,
	duplicateSignals,
	namesAreSimilar,
	type DuplicateSignalKey,
} from '@/lib/duplicateSignals';

export const DUPLICATE_CHECK_SELECT = {
	id: true,
	name: true,
	type: true,
	affiliatedId: true,
	submittedById: true,
	contactEmail: true,
	instagram: true,
	instagramLink: true,
	website: true,
	facebookLink: true,
} as const;

export interface DuplicateCheckSubject {
	id: string;
	name: string;
	type: string;
	affiliatedId: string | null;
	submittedById: string | null;
	contactEmail: string | null;
	instagram: string | null;
	instagramLink: string | null;
	website: string | null;
	facebookLink: string | null;
}

export interface PossibleDuplicate {
	id: string;
	name: string;
	status: 'Pending' | 'Approved';
	type: string;
	location: string;
	matchedOn: string[];
	nameOnly: boolean;
	sameSubmitter: boolean;
}

const RIDE_TYPE = 'GroupRide';

const SIGNAL_KEYS: DuplicateSignalKey[] = [
	'email',
	'instagram',
	'website',
	'facebook',
];

function isRelated(a: DuplicateCheckSubject, b: DuplicateCheckSubject): boolean {
	return (
		a.affiliatedId === b.id ||
		b.affiliatedId === a.id ||
		(a.affiliatedId !== null && a.affiliatedId === b.affiliatedId)
	);
}

const DUPLICATE_CANDIDATES_TTL_SECONDS = 600;

const getDuplicateCandidates = unstable_cache(
	() =>
		prisma.team.findMany({
			where: { status: { in: ['Pending', 'Approved'] } },
			select: {
				...DUPLICATE_CHECK_SELECT,
				status: true,
				location: true,
			},
		}),
	['duplicate-candidates'],
	{
		revalidate: DUPLICATE_CANDIDATES_TTL_SECONDS,
		tags: [DUPLICATE_CANDIDATES_TAG],
	},
);

export async function findPossibleDuplicates(
	subjects: DuplicateCheckSubject[],
): Promise<Map<string, PossibleDuplicate[]>> {
	const results = new Map<string, PossibleDuplicate[]>();
	if (subjects.length === 0) return results;

	const candidates = await getDuplicateCandidates();

	const candidateSignals = candidates.map((candidate) => ({
		candidate,
		signals: duplicateSignals(candidate),
	}));

	for (const subject of subjects) {
		const subjectSignals = duplicateSignals(subject);
		const matches: PossibleDuplicate[] = [];

		for (const { candidate, signals } of candidateSignals) {
			if (candidate.id === subject.id || isRelated(subject, candidate)) continue;

			const matchedOn: string[] = SIGNAL_KEYS.filter((key) =>
				subjectSignals[key].some((value) => signals[key].includes(value)),
			).map((key) => DUPLICATE_SIGNAL_LABELS[key]);
			const hasStrongMatch = matchedOn.length > 0;

			const comparesNames =
				subject.type !== RIDE_TYPE && candidate.type !== RIDE_TYPE;
			if (comparesNames && namesAreSimilar(subject.name, candidate.name)) {
				matchedOn.push('name');
			}
			if (matchedOn.length === 0) continue;

			matches.push({
				id: candidate.id,
				name: candidate.name,
				status: candidate.status === 'Pending' ? 'Pending' : 'Approved',
				type: clubType.fromDb[candidate.type],
				location: candidate.location,
				matchedOn,
				nameOnly: !hasStrongMatch,
				sameSubmitter:
					subject.submittedById !== null &&
					subject.submittedById === candidate.submittedById,
			});
		}

		if (matches.length > 0) results.set(subject.id, matches);
	}

	return results;
}
