import type { AgeRequirement, MileageRequirement } from "./types";

export function formatMemberCount(count: number): string {
  return `${count} members`;
}

export function formatDistance(miles: number): string {
  return `${miles} mi`;
}

export function formatElevation(feet: number): string {
  return feet > 0 ? `${feet.toLocaleString()} ft` : "Flat";
}

export function formatAgeRequirement(age?: AgeRequirement): string {
  if (!age || (age.min === undefined && age.max === undefined)) return "None";
  if (age.min !== undefined && age.max !== undefined) return `${age.min}–${age.max}`;
  if (age.min !== undefined) return `${age.min}+`;
  return `Up to ${age.max}`;
}

export function formatMileageRequirement(req?: MileageRequirement): string {
  if (!req) return "None";
  return `${req.min} mi / ${req.frequency.toLowerCase()}`;
}

export function formatList(items?: string[]): string {
  if (!items || items.length === 0) return "None";
  return items.join(", ");
}

export function formatYesNo(value: boolean): string {
  return value ? "Yes" : "No";
}

export function formatVerification(verified: boolean, lastActiveYear: number): string {
  return verified ? `Verified · Active ${lastActiveYear}` : `Unverified · Last updated ${lastActiveYear}`;
}

export function formatSubmittedDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatSubmitter(
  user: { firstName: string | null; lastName: string | null; email: string } | null,
): string {
  if (!user) return "Anonymous";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name || user.email;
}
