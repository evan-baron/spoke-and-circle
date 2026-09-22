import { getAllTeams } from "./teams";
import type { SearchParams, Team } from "./types";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function matchesKeyword(team: Team, q: string): boolean {
  const needle = normalize(q);
  if (!needle) return true;
  const haystack = [team.name, team.missionStatement ?? "", ...team.tags]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

function matchesLocation(team: Team, location: string): boolean {
  const needle = normalize(location);
  if (!needle) return true;
  const locations = [team.location, ...(team.additionalLocations ?? [])];
  return locations.some((loc) => loc.toLowerCase().includes(needle));
}

function isWomensOnly(team: Team): boolean {
  return (team.personaRestrictions ?? []).some((persona) => persona === "Women Only");
}

function isAcceptingNewRiders(team: Team): boolean {
  if (team.waitlist) return false;
  if (team.memberLimit !== undefined && team.memberCount >= team.memberLimit) return false;
  return true;
}

/**
 * Single boundary all pages/components go through to read team data.
 * Backed by the static array today; swapping in a real database later
 * only means changing what's inside this function and getAllTeams().
 */
export function searchTeams(params: SearchParams): Team[] {
  const {
    q = "",
    location = "",
    type,
    bikeTypes,
    discipline,
    skillLevel,
    competitiveOrCasual,
    womensOnly,
    youthOnly,
    acceptingNewRiders,
  } = params;

  return getAllTeams()
    .filter((team) => matchesKeyword(team, q))
    .filter((team) => matchesLocation(team, location))
    .filter((team) => !type || team.type === type)
    .filter((team) => !bikeTypes?.length || bikeTypes.includes(team.bikeType))
    .filter((team) => !discipline || team.discipline === discipline)
    .filter((team) => !skillLevel || team.skillLevel === skillLevel)
    .filter((team) => !competitiveOrCasual || team.competitiveOrCasual === competitiveOrCasual)
    .filter((team) => !womensOnly || isWomensOnly(team))
    .filter((team) => !youthOnly || team.type === "Youth Program")
    .filter((team) => !acceptingNewRiders || isAcceptingNewRiders(team))
    .sort((a, b) => a.name.localeCompare(b.name));
}
