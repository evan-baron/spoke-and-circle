const PERSONA_LABELS: Record<string, string> = {
	womenOnly: 'Women Only',
	menOnly: 'Men Only',
	lgbtOnly: 'LGBT Only',
};

const EVENT_TYPE_FIELDS: [string, string][] = [
	['eventSponsor', 'Sponsor Events'],
	['eventTeamSpecific', 'Team-specific Events'],
	['eventPublic', 'Public Events'],
	['eventRecruiting', 'Recruiting Events'],
];

export function buildTeamPayload(form: HTMLFormElement) {
	const data = new FormData(form);

	function text(key: string) {
		const value = data.get(key);
		if (typeof value !== 'string') return undefined;
		const trimmed = value.trim();
		return trimmed === '' ? undefined : trimmed;
	}

	function number(key: string) {
		const value = text(key);
		return value === undefined ? undefined : Number(value);
	}

	function flag(key: string) {
		return data.get(key) !== null;
	}

	function values(key: string) {
		return data
			.getAll(key)
			.filter((value): value is string => typeof value === 'string')
			.map((value) => value.trim())
			.filter(Boolean);
	}

	function commaList(key: string) {
		const value = text(key);
		if (value === undefined) return undefined;
		const items = value
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
		return items.length > 0 ? items : undefined;
	}

	const persona = text('personaRestriction');
	const personaOther = text('personaOtherDescription');
	const personaRestrictions =
		persona === 'other' ?
			personaOther ? [personaOther]
			:	undefined
		: persona && PERSONA_LABELS[persona] ? [PERSONA_LABELS[persona]]
		: undefined;

	const eventTypes = EVENT_TYPE_FIELDS.filter(([field]) => flag(field)).map(
		([, label]) => label,
	);

	const duesRequired = flag('duesRequired');
	const mileageMin = number('mileageMin');
	const virtualPlatforms = values('virtualPlatform');
	const additionalLocations = values('additionalLocations');

	return {
		name: text('name'),
		type: text('type'),
		missionStatement: text('missionStatement'),
		codeOfConduct: text('codeOfConduct'),
		affiliation: text('affiliation'),
		location: text('location'),
		additionalLocations:
			additionalLocations.length > 0 ? additionalLocations : undefined,
		founded: number('founded'),
		visibility: text('visibility'),
		primaryLanguage: text('primaryLanguage'),
		contactPhone: text('contactPhone'),
		contactEmail: text('contactEmail'),
		bikeType: text('bikeType'),
		format: text('format'),
		virtualPlatforms: virtualPlatforms.length > 0 ? virtualPlatforms : undefined,
		homeBaseAffiliation: text('homeBaseAffiliation'),
		website: text('website'),
		instagram: text('instagram'),
		facebook: text('facebook'),
		strava: text('strava'),
		discord: text('discord'),
		ageMin: number('ageMin'),
		ageMax: number('ageMax'),
		memberCount: number('memberCount'),
		memberLimit: number('memberLimit'),
		howToJoin: text('howToJoin'),
		personaRestrictions,
		eBikeAllowed: flag('eBikeAllowed'),
		waitlist: flag('waitlist'),
		competitiveOrCasual: text('competitiveOrCasual'),
		skillLevel: text('skillLevel'),
		duesRequired,
		duesAmount: duesRequired ? text('duesAmount') : undefined,
		duesSchedule: duesRequired ? text('duesSchedule') : undefined,
		requiredRaces: number('requiredRaces'),
		mileageMin,
		mileageFrequency:
			mileageMin === undefined ? undefined : text('mileageFrequency'),
		rankingSystem: text('rankingSystem'),
		sponsors: commaList('sponsors'),
		instructional: flag('instructional'),
		requiredRides: flag('requiredRides'),
		requiredKit: flag('requiredKit'),
		hasRoster: flag('hasRoster'),
		eventTypes: eventTypes.length > 0 ? eventTypes : undefined,
		joinTryouts: flag('joinTryouts'),
		joinReferral: flag('joinReferral'),
		joinInviteOnly: flag('joinInviteOnly'),
		joinOpen: flag('joinOpen'),
		antibot: text('antibot'),
		antibotIndex: number('antibotIndex'),
	};
}
