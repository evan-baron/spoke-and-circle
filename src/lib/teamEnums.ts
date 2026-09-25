import type {
	BikeType,
	ClubType,
	DropPolicy,
	Format,
	MtbDiscipline,
	RankingSystem,
	Segmentation,
} from '../../generated/prisma/client';
import type { Team } from './types';

function invert<K extends string, V extends string>(
	record: Record<K, V>,
): Record<V, K> {
	return Object.fromEntries(
		Object.entries(record).map(([key, value]) => [value, key]),
	) as Record<V, K>;
}

export const clubTypeToDb: Record<Team['type'], ClubType> = {
	Team: 'Team',
	Club: 'Club',
	'Group Ride': 'GroupRide',
	'Youth Program': 'YouthProgram',
	Organization: 'Organization',
};

export const bikeTypeToDb: Record<Team['bikeType'], BikeType> = {
	Road: 'Road',
	Gravel: 'Gravel',
	MTB: 'MTB',
	Track: 'Track',
	Tri: 'Tri',
	'E-bike': 'EBike',
	Mixed: 'Mixed',
};

export const formatToDb: Record<Team['format'], Format> = {
	'In-person': 'InPerson',
	Virtual: 'Virtual',
	Hybrid: 'Hybrid',
};

export const disciplineToDb: Record<
	NonNullable<Team['discipline']>,
	MtbDiscipline
> = {
	'Cross-country': 'CrossCountry',
	Trail: 'Trail',
	Enduro: 'Enduro',
	Downhill: 'Downhill',
	'All-mountain': 'AllMountain',
};

export const segmentationToDb: Record<Team['segmentation'], Segmentation> = {
	'A Group': 'AGroup',
	'B Group': 'BGroup',
	'C Group': 'CGroup',
	'N/A': 'NA',
};

export const dropPolicyToDb: Record<Team['dropPolicy'], DropPolicy> = {
	Drop: 'Drop',
	'No-drop': 'NoDrop',
};

export const rankingSystemToDb: Record<Team['rankingSystem'], RankingSystem> = {
	Captains: 'Captains',
	'Ride Leaders': 'RideLeaders',
	Liaison: 'Liaison',
	'N/A': 'NA',
};

export const clubTypeFromDb = invert(clubTypeToDb);
export const bikeTypeFromDb = invert(bikeTypeToDb);
export const formatFromDb = invert(formatToDb);
export const disciplineFromDb = invert(disciplineToDb);
export const segmentationFromDb = invert(segmentationToDb);
export const dropPolicyFromDb = invert(dropPolicyToDb);
export const rankingSystemFromDb = invert(rankingSystemToDb);
