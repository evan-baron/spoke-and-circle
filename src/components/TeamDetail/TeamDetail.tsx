import Link from 'next/link';
import { Badge } from '@/components/Badge/Badge';
import { ContactModal } from '@/components/ContactModal/ContactModal';
import { MailIcon, PhoneIcon } from '@/components/ContactIcons/ContactIcons';
import {
	DetailRow,
	DetailSection,
} from '@/components/DetailSection/DetailSection';
import { TeamMedia } from '@/components/TeamMedia/TeamMedia';
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
import { formatInstagramHandle } from '@/lib/instagram';
import { toneForPace, toneForVerified } from '@/lib/tone';
import type { Team } from '@/lib/types';
import styles from './teamDetail.module.scss';

interface TeamDetailProps {
	team: Team;
	groupRides?: Team[];
	preview?: boolean;
}

export function TeamDetail({
	team,
	groupRides = [],
	preview = false,
}: TeamDetailProps) {
	const joinFlags = [
		team.joinRequirements.open && 'Open to all',
		team.joinRequirements.tryouts && 'Try-outs required',
		team.joinRequirements.referralRequired && 'Referral required',
		team.joinRequirements.inviteOnly && 'Invite only',
	].filter(Boolean) as string[];

	const hasSocial = Object.values(team.social).some(Boolean);

	return (
		<div className={`${styles.detail} ${preview ? styles.preview : ''}`}>
			<header className={styles.header}>
				<div className={styles.badgeRow}>
					<Badge tone='ink'>{team.type}</Badge>
					{team.type === 'Group Ride' && (
						<Badge tone={toneForPace(team.pace)}>{team.pace}</Badge>
					)}
					{team.bikeTypes.map((bikeType) => (
						<Badge key={bikeType} tone='gold'>
							{bikeType}
						</Badge>
					))}
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
					<p className={styles.mission}>&ldquo;{team.missionStatement}&rdquo;</p>
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
						{!preview && (
							<ContactModal
								teamName={team.name}
								email={team.contact.email}
								phone={team.contact.phone}
								website={team.website}
							/>
						)}
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
										{team.affiliatedId && !preview ?
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
													{formatInstagramHandle(team.social.instagram)}
												</a>
											:	formatInstagramHandle(team.social.instagram)}
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
							label='Cycling Discipline(s)'
							value={formatList(team.bikeTypes)}
						/>
						{team.racingDisciplines.length > 0 && (
							<DetailRow
								label='Racing Discipline(s)'
								value={formatList(team.racingDisciplines)}
							/>
						)}
						<DetailRow label='Virtual or in-person' value={team.format} />
						{team.discipline && (
							<DetailRow label='Riding style' value={team.discipline} />
						)}
						{team.virtualPlatform && (
							<DetailRow label='Virtual platform' value={team.virtualPlatform} />
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
						<DetailRow label='Member limit' value={team.memberLimit ?? 'None'} />
						<DetailRow label='Waitlist' value={formatYesNo(team.waitlist)} />
					</DetailSection>

					{team.type === 'Group Ride' && (
						<DetailSection title='Ride profile'>
							{team.rides.map((ride, index) => (
								<DetailRow
									key={index}
									label={
										team.rides.length > 1 ? `Schedule ${index + 1}` : 'Schedule'
									}
									value={
										<>
											{formatRideRecurrence(ride)}
											{ride.details && (
												<span className={styles.rideDetails}>{ride.details}</span>
											)}
										</>
									}
								/>
							))}
							{team.scheduleNotes && (
								<DetailRow label='Schedule notes' value={team.scheduleNotes} />
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

					{team.type === 'Group Ride' && team.additionalRideDetails && (
						<DetailSection title='Additional ride details'>
							<div className={styles.longText}>
								{team.additionalRideDetails
									.split(/\n{2,}/)
									.map((paragraph, index) => (
										<p key={index}>{paragraph}</p>
									))}
							</div>
						</DetailSection>
					)}

					{team.type !== 'Group Ride' && (
						<DetailSection
							title={team.type === 'Team' ? 'Team structure' : 'Group structure'}
						>
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

					<TeamMedia media={team.media ?? []} teamName={team.name} />

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
										<span className={styles.rideValue}>
											<Link
												href={`/teams/${ride.id}`}
												className={styles.affiliationLink}
											>
												{ride.name}
											</Link>
											<Badge tone={toneForPace(ride.pace)}>
												{ride.pace} pace
											</Badge>
										</span>
									}
								/>
							))}
						</DetailSection>
					)}
				</div>
			</div>
		</div>
	);
}
