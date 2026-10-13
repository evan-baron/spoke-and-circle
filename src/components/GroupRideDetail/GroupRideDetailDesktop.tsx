import Link from 'next/link';
import { Badge } from '@/components/Badge/Badge';
import { ContactModal } from '@/components/ContactModal/ContactModal';
import {
	MailIcon,
	PhoneIcon,
	WebsiteIcon,
} from '@/components/ContactIcons/ContactIcons';
import {
	DetailRow,
	DetailSection,
} from '@/components/DetailSection/DetailSection';
import { RouteSection } from '@/components/RouteSection/RouteSection';
import { TeamMedia } from '@/components/TeamMedia/TeamMedia';
import {
	formatDistance,
	formatElevation,
	formatList,
	formatRideRecurrence,
	formatYesNo,
} from '@/lib/format';
import { formatInstagramHandle } from '@/lib/instagram';
import type { ParsedRouteLink } from '@/lib/routeLink';
import { toneForPace } from '@/lib/tone';
import type { Team } from '@/lib/types';
import styles from './groupRideDetail.module.scss';

interface GroupRideDetailDesktopProps {
	team: Team;
	groupRides?: Team[];
	preview?: boolean;
	parsedRouteLink: ParsedRouteLink | null;
}

export function GroupRideDetailDesktop({
	team,
	groupRides = [],
	preview = false,
	parsedRouteLink,
}: GroupRideDetailDesktopProps) {
	const joinFlags = [
		team.joinRequirements.open && 'Open to all',
		team.joinRequirements.tryouts && 'Try-outs required',
		team.joinRequirements.referralRequired && 'Referral required',
		team.joinRequirements.inviteOnly && 'Invite only',
	].filter(Boolean) as string[];

	const hasSocial = Object.values(team.social).some(Boolean);

	return (
		<div className={styles.body}>
			<aside className={styles.aside}>
				{(team.howToJoin || joinFlags.length > 0) && (
					<div className={`${styles.asideCard} ${styles.contactCard}`}>
						<p className={styles.asideTitle}>How to join</p>
						{team.howToJoin && (
							<p className={styles.howToJoin}>{team.howToJoin}</p>
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
					</div>
				)}

				<div className={styles.asideCard}>
					<p className={styles.asideTitle}>Contact Info</p>
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
									{team.contact.email.split('@')[0]}@<wbr />
									{team.contact.email.split('@').slice(1).join('@')}
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
						{!team.contact.email && !team.contact.phone && <dd>Not listed</dd>}
						{team.website && (
							<>
								<dt>Website</dt>
								<dd className={styles.factWithIcon}>
									<WebsiteIcon size={16} />
									<a
										target='_blank'
										rel='noopener noreferrer'
										href={team.website}
										className={styles.website}
									>
										{team.website
											.replace(/^https?:\/\/(www\.)?/i, '')
											.replace(/\/$/, '')}
									</a>
								</dd>
							</>
						)}
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
					</dl>
				</div>
			</aside>

			<div className={styles.main}>
				{parsedRouteLink && (
					<RouteSection route={parsedRouteLink} teamName={team.name} />
				)}

				<DetailSection title='Ride details'>
					{team.ride && (
						<DetailRow
							label='Schedule'
							value={
								<>
									{formatRideRecurrence(team.ride)}
									{team.ride.details && (
										<span className={styles.rideDetails}>
											{team.ride.details}
										</span>
									)}
								</>
							}
						/>
					)}
					{team.scheduleNotes && (
						<DetailRow label='Schedule notes' value={team.scheduleNotes} />
					)}
					<DetailRow
						label='Cycling Discipline(s)'
						value={formatList(team.bikeTypes)}
					/>
					<DetailRow
						label='E-Bike Allowed'
						value={formatYesNo(team.eBikeAllowed)}
					/>
					{team.segmentation && (
						<DetailRow label='Segmentation' value={team.segmentation} />
					)}
					<DetailRow
						label='Typical distance'
						value={formatDistance(team.typicalDistanceMiles)}
					/>
					<DetailRow
						label='Typical elevation gain'
						value={formatElevation(team.typicalElevationGainFt)}
					/>
					<DetailRow label='Drop / no-drop' value={team.dropPolicy} />
					{team.routeLink && !parsedRouteLink && (
						<DetailRow
							label='Route link'
							value={
								<a
									target='_blank'
									rel='noopener noreferrer nofollow'
									href={team.routeLink}
									className={styles.website}
								>
									{team.routeLink}
								</a>
							}
						/>
					)}
				</DetailSection>

				{team.additionalRideDetails && (
					<DetailSection title='Ride summary'>
						<div className={styles.longText}>
							{team.additionalRideDetails
								.split(/\n{2,}/)
								.map((paragraph, index) => (
									<p key={index}>{paragraph}</p>
								))}
						</div>
					</DetailSection>
				)}

				<TeamMedia media={team.media ?? []} teamName={team.name} />

				{groupRides.length > 0 && (
					<DetailSection title='Group rides'>
						{groupRides.map((ride) => (
							<DetailRow
								key={ride.id}
								label={
									ride.ride ? formatRideRecurrence(ride.ride) : 'Group ride'
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
	);
}
