import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/BackButton/BackButton";
import { Badge } from "@/components/Badge/Badge";
import { DetailRow, DetailSection } from "@/components/DetailSection/DetailSection";
import {
  formatAgeRequirement,
  formatDistance,
  formatElevation,
  formatList,
  formatMemberCount,
  formatMileageRequirement,
  formatYesNo,
} from "@/lib/format";
import { getAllTeams, getTeamById } from "@/lib/teams";
import { toneForPace, toneForVisibility } from "@/lib/tone";
import styles from "./team.module.scss";

interface TeamPageParams {
  teamId: string;
}

export async function generateStaticParams(): Promise<TeamPageParams[]> {
  return getAllTeams().map((team) => ({ teamId: team.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<TeamPageParams>;
}): Promise<Metadata> {
  const { teamId } = await params;
  const team = getTeamById(teamId);
  return { title: team ? `${team.name} — Spoke & Circle` : "Team not found — Spoke & Circle" };
}

export default async function TeamPage({ params }: { params: Promise<TeamPageParams> }) {
  const { teamId } = await params;
  const team = getTeamById(teamId);

  if (!team) {
    notFound();
  }

  const joinFlags = [
    team.joinRequirements.open && "Open to all",
    team.joinRequirements.tryouts && "Try-outs required",
    team.joinRequirements.referralRequired && "Referral required",
    team.joinRequirements.inviteOnly && "Invite only",
  ].filter(Boolean) as string[];

  const hasSocial = Object.values(team.social).some(Boolean);

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <BackButton />

        <header className={styles.header}>
          <div className={styles.badgeRow}>
            <Badge tone="ink">{team.type}</Badge>
            <Badge tone={toneForVisibility(team.visibility)}>{team.visibility}</Badge>
            <Badge tone={toneForPace(team.pace)}>{team.pace}</Badge>
            <Badge tone="gold">{team.bikeType}</Badge>
          </div>
          <h1>{team.name}</h1>
          <p className={styles.subline}>
            {team.location} &middot; Founded {team.founded} &middot;{" "}
            {formatMemberCount(team.memberCount)}
          </p>
          {team.missionStatement && <p className={styles.mission}>&ldquo;{team.missionStatement}&rdquo;</p>}
        </header>

        <div className={styles.body}>
          <aside className={styles.aside}>
            <div className={styles.asideCard}>
              <p className={styles.asideTitle}>How to join</p>
              <p>{team.howToJoin}</p>
              {team.waitlist && <p className={styles.waitlistNote}>Currently accepting waitlist signups only.</p>}
              {joinFlags.length > 0 && (
                <div className={styles.flagRow}>
                  {joinFlags.map((flag) => (
                    <span key={flag} className={styles.flag}>
                      {flag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.asideCard}>
              <p className={styles.asideTitle}>Quick facts</p>
              <dl className={styles.factList}>
                <dt>Location</dt>
                <dd>{team.location}</dd>
                {team.additionalLocations && team.additionalLocations.length > 0 && (
                  <>
                    <dt>Also rides in</dt>
                    <dd>{formatList(team.additionalLocations)}</dd>
                  </>
                )}
                <dt>Language</dt>
                <dd>{team.primaryLanguage ?? "English"}</dd>
                {team.affiliation && (
                  <>
                    <dt>Affiliation</dt>
                    <dd>{team.affiliation}</dd>
                  </>
                )}
                <dt>Contact</dt>
                <dd>
                  {team.contact.email && <div>{team.contact.email}</div>}
                  {team.contact.phone && <div>{team.contact.phone}</div>}
                  {!team.contact.email && !team.contact.phone && "Not listed"}
                </dd>
                <dt>Website</dt>
                <dd>{team.website ? <a href={team.website}>{team.website}</a> : "N/A"}</dd>
                {hasSocial && (
                  <>
                    <dt>Social</dt>
                    <dd>
                      {team.social.instagram && <div>Instagram &middot; {team.social.instagram}</div>}
                      {team.social.facebook && <div>Facebook &middot; {team.social.facebook}</div>}
                      {team.social.strava && <div>Strava &middot; {team.social.strava}</div>}
                      {team.social.discord && <div>Discord &middot; {team.social.discord}</div>}
                    </dd>
                  </>
                )}
                {team.codeOfConduct && (
                  <>
                    <dt>Code of conduct</dt>
                    <dd>{team.codeOfConduct}</dd>
                  </>
                )}
              </dl>
            </div>
          </aside>

          <div className={styles.main}>
            <DetailSection title="Format & membership">
              <DetailRow label="Virtual or in-person" value={team.format} />
              {team.virtualPlatform && <DetailRow label="Virtual platform" value={team.virtualPlatform} />}
              {team.homeBaseAffiliation && (
                <DetailRow label="Home-base affiliation" value={team.homeBaseAffiliation} />
              )}
              <DetailRow label="E-bike allowed" value={formatYesNo(team.eBikeAllowed)} />
              <DetailRow label="Age requirement" value={formatAgeRequirement(team.ageRequirement)} />
              <DetailRow label="Persona restrictions" value={formatList(team.personaRestrictions)} />
              <DetailRow label="Member limit" value={team.memberLimit ?? "None"} />
              <DetailRow label="Waitlist" value={formatYesNo(team.waitlist)} />
            </DetailSection>

            <DetailSection title="Ride profile">
              <DetailRow label="Schedule" value={team.rideSchedule} />
              {team.startTimes && <DetailRow label="Start times" value={formatList(team.startTimes)} />}
              <DetailRow label="Segmentation" value={team.segmentation} />
              <DetailRow label="Typical distance" value={formatDistance(team.typicalDistanceMiles)} />
              <DetailRow label="Typical elevation gain" value={formatElevation(team.typicalElevationGainFt)} />
              <DetailRow label="Drop / no-drop" value={team.dropPolicy} />
              <DetailRow label="Ride visibility" value={team.rideVisibility} />
            </DetailSection>

            <DetailSection title="Team structure">
              <DetailRow label="Competitive or casual" value={team.competitiveOrCasual} />
              <DetailRow label="Skill level" value={team.skillLevel} />
              <DetailRow label="Instructional" value={formatYesNo(team.instructional)} />
              <DetailRow
                label="Dues"
                value={
                  team.duesRequired
                    ? `${team.duesAmount ?? "Required"}${team.duesSchedule ? ` (${team.duesSchedule})` : ""}`
                    : "Not required"
                }
              />
              <DetailRow label="Required rides" value={formatYesNo(team.requiredRides)} />
              <DetailRow label="Required races (min)" value={team.requiredRaces ?? "None"} />
              <DetailRow label="Mileage requirement" value={formatMileageRequirement(team.mileageRequirement)} />
              <DetailRow label="Required kit / uniform" value={formatYesNo(team.requiredKit)} />
              <DetailRow label="Rankings" value={team.rankingSystem} />
              <DetailRow label="Roster" value={formatYesNo(team.hasRoster)} />
              <DetailRow label="Sponsors" value={formatList(team.sponsors)} />
              <DetailRow label="Event types" value={formatList(team.eventTypes)} />
            </DetailSection>
          </div>
        </div>
      </div>
    </main>
  );
}
