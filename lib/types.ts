// Data shape mirrors the club/team intake form, grouped into the same
// four sections so the detail page can render section-for-section.

export type ClubType = "Team" | "Club" | "Group Ride" | "Youth Program" | "Organization";

export type BikeType =
  | "Road"
  | "Gravel"
  | "MTB"
  | "Track"
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

export type RankingSystem = "Captains" | "Ride Leaders" | "Liaison" | "N/A";

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
  homeBaseAffiliation?: string;
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
  skillLevel: SkillLevel;
  instructional: boolean;
  duesRequired: boolean;
  duesAmount?: string;
  duesSchedule?: ScheduleFrequency;
  requiredRides: boolean;
  requiredRaces?: number;
  mileageRequirement?: MileageRequirement;
  requiredKit: boolean;
  rankingSystem: RankingSystem;
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
