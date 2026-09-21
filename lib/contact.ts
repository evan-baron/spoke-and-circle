import type { Team } from "./types";

export interface PrimaryContact {
  href: string;
  /** The channel this resolves to, shown as a caption under the "Contact team" button. */
  channel: string;
}

/**
 * Picks the single best "Contact Team" action for a team, in the order a
 * prospective member is most likely to get a response: email, then
 * whichever social/chat channel the team actually uses, then their website.
 */
export function getPrimaryContact(team: Team): PrimaryContact | null {
  if (team.contact.email) {
    return { href: `mailto:${team.contact.email}`, channel: "via email" };
  }
  if (team.social.discord) {
    const href = team.social.discord.startsWith("http")
      ? team.social.discord
      : `https://${team.social.discord}`;
    return { href, channel: "via Discord" };
  }
  if (team.social.instagram) {
    return {
      href: `https://instagram.com/${team.social.instagram.replace(/^@/, "")}`,
      channel: "via Instagram",
    };
  }
  if (team.social.facebook) {
    return { href: `https://facebook.com/${team.social.facebook}`, channel: "via Facebook" };
  }
  if (team.social.strava) {
    return { href: `https://strava.com/clubs/${team.social.strava}`, channel: "via Strava" };
  }
  if (team.website) {
    return { href: team.website, channel: "via website" };
  }
  if (team.contact.phone) {
    return { href: `tel:${team.contact.phone}`, channel: "by phone" };
  }
  return null;
}
