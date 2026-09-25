import 'dotenv/config';
import type { Prisma } from '../generated/prisma/client';
import {
	bikeTypeToDb,
	clubTypeToDb,
	disciplineToDb,
	dropPolicyToDb,
	formatToDb,
	rankingSystemToDb,
	segmentationToDb,
} from '../src/lib/teamEnums';
import { teams } from '../src/lib/teams';
import type { Team } from '../src/lib/types';

if (process.env.NODE_ENV === 'production') {
	throw new Error('Refusing to seed with NODE_ENV=production');
}

function toTeamData(team: Team): Prisma.TeamCreateInput {
	return {
		status: 'Approved',
		name: team.name,
		type: clubTypeToDb[team.type],
		missionStatement: team.missionStatement,
		codeOfConduct: team.codeOfConduct,
		affiliation: team.affiliation,
		location: team.location,
		additionalLocations: team.additionalLocations ?? [],
		founded: team.founded,
		visibility: team.visibility,
		primaryLanguage: team.primaryLanguage,
		contactPhone: team.contact.phone,
		contactEmail: team.contact.email,
		verified: team.verified,
		lastActiveYear: team.lastActiveYear,
		bikeType: bikeTypeToDb[team.bikeType],
		discipline: team.discipline ? disciplineToDb[team.discipline] : undefined,
		eBikeAllowed: team.eBikeAllowed,
		format: formatToDb[team.format],
		virtualPlatforms: team.virtualPlatform ? [team.virtualPlatform] : [],
		homeBaseAffiliation: team.homeBaseAffiliation,
		website: team.website,
		instagram: team.social.instagram,
		facebook: team.social.facebook,
		strava: team.social.strava,
		discord: team.social.discord,
		ageMin: team.ageRequirement?.min,
		ageMax: team.ageRequirement?.max,
		personaRestrictions: team.personaRestrictions ?? [],
		memberCount: team.memberCount,
		memberLimit: team.memberLimit,
		waitlist: team.waitlist,
		howToJoin: team.howToJoin,
		rideSchedule: team.rideSchedule,
		startTimes: team.startTimes ?? [],
		pace: team.pace,
		segmentation: segmentationToDb[team.segmentation],
		typicalDistanceMiles: team.typicalDistanceMiles,
		typicalElevationGainFt: team.typicalElevationGainFt,
		dropPolicy: dropPolicyToDb[team.dropPolicy],
		rideVisibility: team.rideVisibility,
		competitiveOrCasual: team.competitiveOrCasual,
		skillLevel: team.skillLevel,
		instructional: team.instructional,
		duesRequired: team.duesRequired,
		duesAmount: team.duesAmount,
		duesSchedule: team.duesSchedule,
		requiredRides: team.requiredRides,
		requiredRaces: team.requiredRaces,
		mileageMin: team.mileageRequirement?.min,
		mileageFrequency: team.mileageRequirement?.frequency,
		requiredKit: team.requiredKit,
		rankingSystem: rankingSystemToDb[team.rankingSystem],
		hasRoster: team.hasRoster,
		sponsors: team.sponsors ?? [],
		eventTypes: team.eventTypes ?? [],
		joinTryouts: team.joinRequirements.tryouts,
		joinReferral: team.joinRequirements.referralRequired,
		joinInviteOnly: team.joinRequirements.inviteOnly,
		joinOpen: team.joinRequirements.open,
		tags: team.tags,
	};
}

async function main() {
	const { prisma } = await import('../src/lib/prisma');
	const { resolveCoordinates } = await import('../src/services/placeService');

	for (const team of teams) {
		const data = {
			...toTeamData(team),
			...(await resolveCoordinates(team.location)),
		};
		const existing = await prisma.team.findFirst({
			where: { name: data.name },
			select: { id: true },
		});
		if (existing) {
			await prisma.team.update({ where: { id: existing.id }, data });
		} else {
			await prisma.team.create({ data });
		}
	}

	const count = await prisma.team.count();
	console.log(`Seeded ${teams.length} teams (${count} total in database)`);
	await prisma.$disconnect();
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
