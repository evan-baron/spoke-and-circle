import type {
	ClubType,
	BikeType,
	RacingDiscipline,
	Format,
	VirtualPlatform,
	Pace,
	SkillLevel,
	MtbDiscipline,
	Segmentation,
	ScheduleFrequency,
	DropPolicy,
	RideOrdinal,
} from './enums';

export type {
	ClubType,
	BikeType,
	RacingDiscipline,
	Format,
	VirtualPlatform,
	Pace,
	SkillLevel,
	MtbDiscipline,
	Segmentation,
	ScheduleFrequency,
	DropPolicy,
	RideOrdinal,
} from './enums';

// Data shape mirrors the club/team intake form, grouped into the same
// four sections so the detail page can render section-for-section.



export interface AgeRequirement {
  min?: number;
  max?: number;
}

export interface MileageRequirement {
  min: number;
  frequency: ScheduleFrequency;
}

export interface RideDay {
  day: string;
  details?: string;
}

export type RidePattern = "weekly" | "biweekly" | "monthly";

export interface Ride {
  pattern: RidePattern;
  days: string[];
  ordinals?: RideOrdinal[];
  startDate?: string;
  startTime?: string;
  monthFrom?: number;
  monthTo?: number;
  details?: string;
}

export interface JoinRequirements {
  tryouts: boolean;
  referralRequired: boolean;
  inviteOnly: boolean;
  open: boolean;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
}

export interface SocialLinks {
  instagram?: string;
  instagramLink?: string;
  facebook?: string;
  facebookLink?: string;
  strava?: string;
  discord?: string;
}

export interface Team {
  id: string;

  // -- Generic Info --
  name: string;
  type: ClubType;
  missionStatement?: string;
  codeOfConduct?: string;
  affiliation?: string;
  affiliatedId?: string;
  location: string;
  additionalLocations?: string[];
  founded: number;
  contact: ContactInfo;
  primaryLanguage?: string;

  // -- Trust & verification (shown so riders can tell a listing is current,
  // not an abandoned Facebook group) --
  verified: boolean;
  lastActiveYear: number;

  // -- Details --
  bikeTypes: BikeType[];
  discipline?: MtbDiscipline;
  racingDisciplines: RacingDiscipline[];
  eBikeAllowed: boolean;
  format: Format;
  virtualPlatform?: VirtualPlatform;
  homeBase?: string;
  website?: string;
  social: SocialLinks;
  ageRequirement?: AgeRequirement;
  personaRestrictions?: string[];
  memberCount: number;
  memberLimit?: number;
  waitlist: boolean;
  howToJoin: string;

  // -- Ride Details --
  rideSchedule: ScheduleFrequency;
  startTimes?: string[];
  rideDays?: RideDay[];
  rides: Ride[];
  scheduleNotes?: string;
  pace: Pace;
  segmentation: Segmentation;
  typicalDistanceMiles: number;
  typicalElevationGainFt: number;
  dropPolicy: DropPolicy;

  // -- Team/Club Details --
  competitiveOrCasual: "Competitive" | "Recreational";
  skillLevels: SkillLevel[];
  instructional: boolean;
  duesRequired: boolean;
  duesAmount?: string;
  duesSchedule?: ScheduleFrequency;
  requiredRides: boolean;
  requiredRaces?: number;
  mileageRequirement?: MileageRequirement;
  requiredKit: boolean;
  sponsors?: string[];
  eventTypes?: string[];
  joinRequirements: JoinRequirements;

  // -- Search aid, not part of the intake form --
  tags: string[];
}

// -- Rider intake ("get-started" quiz) --
// Collected client-side to prefill a search today; will seed a rider
// profile once accounts exist.
export interface RiderPreferences {
  zipCode: string;
  disciplines: BikeType[];
  skillLevel: SkillLevel | null;
  lookingFor: Extract<ClubType, "Team" | "Club" | "Group Ride"> | null;
}

export interface SearchParams {
  q?: string;
  location?: string;
  radius?: number;
  type?: ClubType;
  bikeTypes?: BikeType[];
  discipline?: MtbDiscipline;
  skillLevel?: SkillLevel;
  competitiveOrCasual?: "Competitive" | "Recreational";
  racingDisciplines?: RacingDiscipline[];
  womensOnly?: boolean;
  youthOnly?: boolean;
  acceptingNewRiders?: boolean;
}

export interface TeamsResponse {
  success: boolean;
  teams: Team[];
}

export interface TeamFormValues {
  name: string;
  type: string;
  missionStatement: string;
  codeOfConduct: string;
  affiliation: string;
  affiliatedId: string;
  location: string;
  additionalLocations: string[];
  founded: string;
  primaryLanguage: string;
  contactPhone: string;
  contactEmail: string;
  bikeTypes: string[];
  racingDisciplines: string[];
  tags: string[];
  format: string;
  virtualPlatform: string[];
  homeBase: string;
  website: string;
  instagram: string;
  instagramLink: string;
  facebook: string;
  facebookLink: string;
  strava: string;
  discord: string;
  ageMin: string;
  ageMax: string;
  memberCount: string;
  memberLimit: string;
  howToJoin: string;
  personaRestriction: string | null;
  personaOtherDescription: string;
  eBikeAllowed: boolean;
  waitlist: boolean;
  rides: Ride[];
  scheduleNotes: string;
  pace: string;
  typicalDistanceMiles: string;
  typicalElevationGainFt: string;
  dropPolicy: string;
  competitiveOrCasual: string;
  skillLevels: string[];
  duesAmount: string;
  duesSchedule: string;
  requiredRaces: string;
  mileageMin: string;
  mileageFrequency: string;
  sponsors: string;
  instructional: boolean;
  duesRequired: boolean;
  requiredRides: boolean;
  requiredKit: boolean;
  eventSponsor: boolean;
  eventTeamSpecific: boolean;
  eventPublic: boolean;
  eventRecruiting: boolean;
  joinTryouts: boolean;
  joinReferral: boolean;
  joinInviteOnly: boolean;
  joinOpen: boolean;
}

export interface CreateTeamResponse {
  success: boolean;
  published: boolean;
  team: { id: string };
}

export interface CurrentUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "user" | "admin";
  isAdmin: boolean;
}

export interface UserOption {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

export interface LocationOption {
  placeId: string;
  label: string;
}

export interface LocationsResponse {
  success: boolean;
  locations: LocationOption[];
}

export interface TeamOption {
  id: string;
  label: string;
  location: string;
}

export interface TeamSearchResponse {
  success: boolean;
  teams: TeamOption[];
}
