// Data shape mirrors the club/team intake form, grouped into the same
// four sections so the detail page can render section-for-section.

export type ClubType = "Team" | "Club" | "Group Ride" | "Youth Program" | "Organization";

export type BikeType =
  | "Road"
  | "Gravel"
  | "MTB"
  | "Track"
  | "BMX"
  | "Tri"
  | "E-bike"
  | "Mixed";

export type Format = "In-person" | "Virtual" | "Hybrid";

export type VirtualPlatform = "Zwift" | "Strava" | "TrainerRoad" | "Other";

export type Pace = "Casual" | "Steady" | "Competitive";

export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export type MtbDiscipline = "Cross-country" | "Trail" | "Enduro" | "Downhill" | "All-mountain";

export type Segmentation = "A Group" | "B Group" | "C Group" | "N/A";

export type ScheduleFrequency = "Weekly" | "Monthly" | "Annually";

export type DropPolicy = "Drop" | "No-drop";


export type Visibility = "Public" | "Private";

export interface AgeRequirement {
  min?: number;
  max?: number;
}

export interface MileageRequirement {
  min: number;
  frequency: ScheduleFrequency;
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
  facebook?: string;
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
  location: string;
  additionalLocations?: string[];
  founded: number;
  visibility: Visibility;
  contact: ContactInfo;
  primaryLanguage?: string;

  // -- Trust & verification (shown so riders can tell a listing is current,
  // not an abandoned Facebook group) --
  verified: boolean;
  lastActiveYear: number;

  // -- Details --
  bikeType: BikeType;
  discipline?: MtbDiscipline;
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
  pace: Pace;
  segmentation: Segmentation;
  typicalDistanceMiles: number;
  typicalElevationGainFt: number;
  dropPolicy: DropPolicy;
  rideVisibility: Visibility;

  // -- Team/Club Details --
  competitiveOrCasual: "Competitive" | "Casual";
  skillLevels: SkillLevel[];
  instructional: boolean;
  duesRequired: boolean;
  duesAmount?: string;
  duesSchedule?: ScheduleFrequency;
  requiredRides: boolean;
  requiredRaces?: number;
  mileageRequirement?: MileageRequirement;
  requiredKit: boolean;
  hasRoster: boolean;
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
  competitiveOrCasual?: "Competitive" | "Casual";
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
  location: string;
  additionalLocations: string[];
  founded: string;
  visibility: string;
  primaryLanguage: string;
  contactPhone: string;
  contactEmail: string;
  bikeType: string;
  format: string;
  virtualPlatform: string[];
  homeBase: string;
  website: string;
  instagram: string;
  facebook: string;
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
  rideSchedule: string;
  startTimes: string;
  pace: string;
  typicalDistanceMiles: string;
  typicalElevationGainFt: string;
  dropPolicy: string;
  rideVisibility: string;
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
  hasRoster: boolean;
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
  team: { id: string };
}

export interface CurrentUser {
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "user" | "admin";
  isAdmin: boolean;
}

export interface LocationOption {
  placeId: string;
  label: string;
}

export interface LocationsResponse {
  success: boolean;
  locations: LocationOption[];
}
