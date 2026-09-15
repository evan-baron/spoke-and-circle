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

/**
 * Single boundary all pages/components go through to read team data.
 * Backed by the static array today; swapping in a real database later
 * only means changing what's inside this function and getAllTeams().
 */
export function searchTeams(params: SearchParams): Team[] {
  const { q = "", location = "", type, bikeType } = params;

  return getAllTeams()
    .filter((team) => matchesKeyword(team, q))
    .filter((team) => matchesLocation(team, location))
    .filter((team) => !type || team.type === type)
    .filter((team) => !bikeType || team.bikeType === bikeType)
    .sort((a, b) => a.name.localeCompare(b.name));
}
