import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BackButton } from '@/components/BackButton/BackButton';
import { Badge } from '@/components/Badge/Badge';
import { ContactModal } from '@/components/ContactModal/ContactModal';
import DeleteTeamButton from '@/components/DeleteTeamButton/DeleteTeamButton';
import { MailIcon, PhoneIcon } from '@/components/ContactIcons/ContactIcons';
import {
	DetailRow,
	DetailSection,
} from '@/components/DetailSection/DetailSection';
import {
	formatAgeRequirement,
	formatDistance,
	formatElevation,
	formatList,
	formatMemberCount,
	formatMileageRequirement,
	formatRideRecurrence,
	formatSkillLevels,
	formatVerification,
	formatYesNo,
} from '@/lib/format';
import { jsonLdScript } from '@/lib/jsonLd';
import { getSiteUrl, OG_IMAGE_PATH, SITE_NAME } from '@/lib/siteConfig';
import { toneForPace, toneForVerified } from '@/lib/tone';
import { getCurrentUser } from '@/services/currentUserService';
import {
	getApprovedGroupRides,
	getApprovedTeamById,
	isApprovedTeamOwner,
} from '@/services/teamService';
import styles from './team.module.scss';

interface TeamPageParams {
	teamId: string;
}

function bikeTypesLabel(bikeTypes: string[]): string {
	return bikeTypes.length > 1 ? 'Mixed' : (bikeTypes[0] ?? 'Mixed');
}

export async function generateMetadata({
	params,
}: {
	params: Promise<TeamPageParams>;
}): Promise<Metadata> {
	const { teamId } = await params;
	const team = await getApprovedTeamById(teamId);
	if (!team) {
		return { title: 'Team not found', robots: { index: false, follow: false } };
	}

	const title = `${team.name}: ${team.type} in ${team.location}`;
	const summary =
		team.missionStatement ??
		`${team.name} is a ${bikeTypesLabel(team.bikeTypes).toLowerCase()} ${team.type.toLowerCase()} based in ${team.location}. See how to join, when they ride, and how to get in touch.`;
	const description =
		summary.length > 160 ? `${summary.slice(0, 157)}...` : summary;

	return {
		title,
		description,
		alternates: { canonical: `/teams/${team.id}` },
		openGraph: {
			title,
			description,
			url: `/teams/${team.id}`,
			siteName: SITE_NAME,
			images: [
				{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: SITE_NAME },
			],
			locale: 'en_US',
			type: 'website',
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [OG_IMAGE_PATH],
		},
	};
}

export default async function TeamPage({
	params,
}: {
	params: Promise<TeamPageParams>;
}) {
	const { teamId } = await params;
	const [team, currentUser] = await Promise.all([
		getApprovedTeamById(teamId),
		getCurrentUser(),
	]);

	if (!team) {
		notFound();
	}

	const groupRides =
		team.type === 'Group Ride' ? [] : await getApprovedGroupRides(team.id);

	const isOwner =
		currentUser && !currentUser.isAdmin ?
			await isApprovedTeamOwner(team.id, currentUser.id)
		:	false;

	const editHref =
		currentUser?.isAdmin ? `/admin/teams/${team.id}/edit`
		: isOwner ? `/dashboard/teams/${team.id}/edit`
		: null;

	const canDeleteGroupRide =
		team.type === 'Group Ride' && (currentUser?.isAdmin || isOwner);

	const canAddGroupRide =
		team.type !== 'Group Ride' && (currentUser?.isAdmin || isOwner);

	const joinFlags = [
		team.joinRequirements.open && 'Open to all',
		team.joinRequirements.tryouts && 'Try-outs required',
		team.joinRequirements.referralRequired && 'Referral required',
		team.joinRequirements.inviteOnly && 'Invite only',
	].filter(Boolean) as string[];

	const hasSocial = Object.values(team.social).some(Boolean);

	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'SportsOrganization',
		name: team.name,
		sport: 'Cycling',
		url: `${getSiteUrl()}/teams/${team.id}`,
		description: team.missionStatement,
		location: { '@type': 'Place', name: team.location },
		...(team.founded > 0 ? { foundingDate: String(team.founded) } : {}),
		...(team.website ? { sameAs: [team.website] } : {}),
	};

	return (
		<div className={styles.page}>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: jsonLdScript(structuredData) }}
			/>
			<div className={styles.wrap}>
				<div className={styles.topRow}>
					<BackButton />
					{editHref && (
						<div className={styles.topActions}>
							{canAddGroupRide && (
								<Link
									href={`/teams/new?from=${team.id}`}
									className={styles.editLink}
								>
									Add a group ride
								</Link>
							)}
							<Link href={editHref} className={styles.editLink}>
								Edit
							</Link>
							{canDeleteGroupRide && (
								<DeleteTeamButton
									teamId={team.id}
									teamName={team.name}
									redirectTo={
										currentUser?.isAdmin ? '/admin/all' : '/dashboard'
									}
								/>
							)}
						</div>
					)}
				</div>

				<header className={styles.header}>
					<div className={styles.badgeRow}>
						<Badge tone='ink'>{team.type}</Badge>
						<Badge tone={toneForPace(team.pace)}>{team.pace}</Badge>
						<Badge tone='gold'>{bikeTypesLabel(team.bikeTypes)}</Badge>
						{team.discipline && <Badge tone='gold'>{team.discipline}</Badge>}
						<Badge tone={toneForVerified(team.verified)}>
							{formatVerification(team.verified, team.lastActiveYear)}
						</Badge>
					</div>
					<h1>{team.name}</h1>
					<p className={styles.subline}>
						{team.location}
						{team.founded > 0 && <> &middot; Founded {team.founded}</>}
						{team.memberCount > 0 && (
							<> &middot; {formatMemberCount(team.memberCount)}</>
						)}
					</p>
					{team.missionStatement && (
						<p className={styles.mission}>
							&ldquo;{team.missionStatement}&rdquo;
						</p>
					)}
				</header>

				<div className={styles.body}>
					<aside className={styles.aside}>
						<div className={`${styles.asideCard} ${styles.contactCard}`}>
							<p className={styles.asideTitle}>How to join</p>
							<p className={styles.howToJoin}>{team.howToJoin}</p>
							{team.waitlist && (
								<p className={styles.waitlistNote}>
									Currently accepting waitlist signups only.
								</p>
							)}
							{joinFlags.length > 0 && (
								<div className={styles.flagRow}>
									{joinFlags.map((flag) => (
										<span key={flag} className={styles.flag}>
											{flag}
										</span>
									))}
								</div>
							)}
							<ContactModal
								teamName={team.name}
								email={team.contact.email}
								phone={team.contact.phone}
								website={team.website}
							/>
						</div>

						<div className={styles.asideCard}>
							<p className={styles.asideTitle}>Quick facts</p>
							<dl className={styles.factList}>
								<dt>Location</dt>
								<dd>{team.location}</dd>
								{team.additionalLocations &&
									team.additionalLocations.length > 0 && (
										<>
											<dt>Also rides in</dt>
											<dd>{formatList(team.additionalLocations)}</dd>
										</>
									)}
								<dt>Language</dt>
								<dd>{team.primaryLanguage ?? 'English'}</dd>
								{team.affiliation && (
									<>
										<dt>Affiliation</dt>
										<dd>
											{team.affiliatedId ?
												<Link
													href={`/teams/${team.affiliatedId}`}
													className={styles.affiliationLink}
												>
													{team.affiliation}
												</Link>
											:	team.affiliation}
										</dd>
									</>
								)}
								<dt>Contact</dt>
								{team.contact.email && (
									<dd className={styles.factWithIcon}>
										<MailIcon size={16} />
										<a
											href={`mailto:${team.contact.email}`}
											className={styles.contactLink}
										>
											{team.contact.email}
										</a>
									</dd>
								)}
								{team.contact.phone && (
									<dd className={styles.factWithIcon}>
										<PhoneIcon size={16} />
										<a
											href={`tel:${team.contact.phone}`}
											className={styles.phoneLink}
										>
											{team.contact.phone}
										</a>
									</dd>
								)}
								{!team.contact.email && !team.contact.phone && (
									<dd>Not listed</dd>
								)}
								<dt>Website</dt>
								<dd>
									{team.website ?
										<a
											target='_blank'
											rel='noopener noreferrer'
											href={team.website}
											className={styles.website}
										>
											{team.website}
										</a>
									:	'N/A'}
								</dd>
								{hasSocial && (
									<>
										<dt>Social</dt>
										{team.social.instagram && (
											<dd>
												Instagram &middot;{' '}
												{team.social.instagramLink ?
													<a
														target='_blank'
														rel='noopener noreferrer'
														href={team.social.instagramLink}
														className={styles.website}
													>
														{team.social.instagram}
													</a>
												:	team.social.instagram}
											</dd>
										)}
										{team.social.facebook && (
											<dd>
												Facebook &middot;{' '}
												{team.social.facebookLink ?
													<a
														target='_blank'
														rel='noopener noreferrer'
														href={team.social.facebookLink}
														className={styles.website}
													>
														{team.social.facebook}
													</a>
												:	team.social.facebook}
											</dd>
										)}
										{team.social.strava && (
											<dd>Strava &middot; {team.social.strava}</dd>
										)}
										{team.social.discord && (
											<dd>Discord &middot; {team.social.discord}</dd>
										)}
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
						<DetailSection title='Format & membership'>
							<DetailRow
								label='Cycling Disciplines'
								value={formatList(team.bikeTypes)}
							/>
							<DetailRow label='Virtual or in-person' value={team.format} />
							{team.discipline && (
								<DetailRow label='Riding style' value={team.discipline} />
							)}
							{team.virtualPlatform && (
								<DetailRow
									label='Virtual platform'
									value={team.virtualPlatform}
								/>
							)}
							{team.homeBase && (
								<DetailRow label='Home Base' value={team.homeBase} />
							)}
							<DetailRow
								label='E-bike allowed'
								value={formatYesNo(team.eBikeAllowed)}
							/>
							<DetailRow
								label='Age requirement'
								value={formatAgeRequirement(team.ageRequirement)}
							/>
							<DetailRow
								label='Persona restrictions'
								value={formatList(team.personaRestrictions)}
							/>
							<DetailRow
								label='Member limit'
								value={team.memberLimit ?? 'None'}
							/>
							<DetailRow label='Waitlist' value={formatYesNo(team.waitlist)} />
						</DetailSection>

						{team.type === 'Group Ride' && (
							<DetailSection title='Ride profile'>
								{team.rides.map((ride, index) => (
									<DetailRow
										key={index}
										label={
											team.rides.length > 1 ?
												`Schedule ${index + 1}`
											:	'Schedule'
										}
										value={
											<>
												{formatRideRecurrence(ride)}
												{ride.details && (
													<span className={styles.rideDetails}>
														{ride.details}
													</span>
												)}
											</>
										}
									/>
								))}
								{team.scheduleNotes && (
									<DetailRow
										label='Schedule notes'
										value={team.scheduleNotes}
									/>
								)}
								<DetailRow label='Segmentation' value={team.segmentation} />
								<DetailRow
									label='Typical distance'
									value={formatDistance(team.typicalDistanceMiles)}
								/>
								<DetailRow
									label='Typical elevation gain'
									value={formatElevation(team.typicalElevationGainFt)}
								/>
								<DetailRow label='Drop / no-drop' value={team.dropPolicy} />
							</DetailSection>
						)}

						{team.type !== 'Group Ride' && (
							<DetailSection title='Team structure'>
								<DetailRow
									label='Competitive or recreational'
									value={team.competitiveOrCasual}
								/>
								<DetailRow
									label='Skill levels'
									value={formatSkillLevels(team.skillLevels)}
								/>
								<DetailRow
									label='Instructional'
									value={formatYesNo(team.instructional)}
								/>
								<DetailRow
									label='Dues'
									value={
										team.duesRequired ?
											`${team.duesAmount ?? 'Required'}${team.duesSchedule ? ` (${team.duesSchedule})` : ''}`
										:	'Not required'
									}
								/>
								<DetailRow
									label='Required rides'
									value={formatYesNo(team.requiredRides)}
								/>
								<DetailRow
									label='Required races (min)'
									value={team.requiredRaces ?? 'None'}
								/>
								<DetailRow
									label='Mileage requirement'
									value={formatMileageRequirement(team.mileageRequirement)}
								/>
								<DetailRow
									label='Required kit / uniform'
									value={formatYesNo(team.requiredKit)}
								/>
								<DetailRow
									label='Event types'
									value={formatList(team.eventTypes)}
								/>
								<DetailRow label='Sponsors' value={formatList(team.sponsors)} />
							</DetailSection>
						)}

						{groupRides.length > 0 && (
							<DetailSection title='Group rides'>
								{groupRides.map((ride) => (
									<DetailRow
										key={ride.id}
										label={
											ride.rides[0] ?
												formatRideRecurrence(ride.rides[0])
											:	'Group ride'
										}
										value={
											<>
												<Link
													href={`/teams/${ride.id}`}
													className={styles.affiliationLink}
												>
													{ride.name}
												</Link>{' '}
												<Badge tone={toneForPace(ride.pace)}>{ride.pace}</Badge>
											</>
										}
									/>
								))}
							</DetailSection>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
