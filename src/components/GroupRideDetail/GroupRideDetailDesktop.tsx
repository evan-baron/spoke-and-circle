import Link from 'next/link';
import { Badge } from '@/components/Badge/Badge';
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
	formatRideParts,
	formatRideRecurrence,
	formatYesNo,
} from '@/lib/format';
import { formatInstagramHandle } from '@/lib/instagram';
import type { ParsedRouteLink } from '@/lib/routeLink';
import { toneForPace } from '@/lib/tone';
import type { Ride, Team } from '@/lib/types';
import styles from './groupRideDetail.module.scss';

const MAX_MORE_RIDES = 3;

function RideSchedule({ ride }: { ride: Ride }) {
	const { cadence, time, months } = formatRideParts(ride);

	return (
		<>
			{[cadence, time].filter(Boolean).join(' · ')}
			{months && (
				<>
					{' · '}
					<strong className={styles.rideMonths}>{months}</strong>
				</>
			)}
		</>
	);
}

interface GroupRideDetailDesktopProps {
	team: Team;
	groupRides?: Team[];
	preview?: boolean;
	parsedRouteLink: ParsedRouteLink | null;
	routePromptHref?: string;
}

export function GroupRideDetailDesktop({
	team,
	groupRides = [],
	preview = false,
	parsedRouteLink,
	routePromptHref,
}: GroupRideDetailDesktopProps) {
	const joinFlags = [
		team.joinRequirements.open && 'Open to all',
		team.joinRequirements.tryouts && 'Try-outs required',
		team.joinRequirements.referralRequired && 'Referral required',
		team.joinRequirements.inviteOnly && 'Invite only',
	].filter(Boolean) as string[];

	const hasSocial = Object.values(team.social).some(Boolean);
	const hasMap = Boolean(parsedRouteLink);
	const hasJoinCard = Boolean(team.howToJoin) || joinFlags.length > 0;
	const visibleRides = groupRides.slice(0, MAX_MORE_RIDES);
	const hasMoreRides = Boolean(team.affiliation) && visibleRides.length > 0;
	const hasSide = hasJoinCard || hasMoreRides;

	const joinCard = hasJoinCard && (
		<div className={`${styles.asideCard} ${styles.contactCard}`}>
			<p className={styles.asideTitle}>How to join</p>
			{team.howToJoin && <p className={styles.howToJoin}>{team.howToJoin}</p>}
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
	);

	const moreRides = hasMoreRides && (
		<DetailSection title={`More rides from ${team.affiliation}`}>
			{visibleRides.map((ride) => (
				<DetailRow
					key={ride.id}
					label={ride.ride ? formatRideRecurrence(ride.ride) : 'Group ride'}
					value={
						<span className={styles.rideValue}>
							<Link
								href={`/teams/${ride.id}`}
								className={styles.affiliationLink}
							>
								{ride.name}
							</Link>
						</span>
					}
				/>
			))}
			{groupRides.length > MAX_MORE_RIDES && team.affiliatedId && (
				<div className={styles.seeAll}>
					<Link
						href={`/teams/${team.affiliatedId}`}
						className={styles.affiliationLink}
					>
						See all rides from {team.affiliation}
					</Link>
				</div>
			)}
		</DetailSection>
	);

	const routePrompt = !hasMap && routePromptHref && (
		<Link href={routePromptHref} className={styles.routePrompt}>
			<strong>
				{team.routeLink ?
					"This route link can't be shown as a map"
				:	'Add a route link to show a map here'}
			</strong>
			<span>
				{team.routeLink ?
					'Use a Ride with GPS or Strava route link to display it. Only you can see this note.'
				:	'Paste a Ride with GPS or Strava route link when you edit this ride. Only you can see this note.'
				}
			</span>
		</Link>
	);

	const contactCard = (
		<div
			className={`${styles.asideCard} ${hasMap ? '' : `${styles.contactStrip} ${styles.areaContact}`}`}
		>
			<p className={styles.asideTitle}>Contact Info</p>
			<dl className={styles.factList}>
				<div className={styles.factGroup}>
					<dt>Location</dt>
					<dd>{team.location}</dd>
				</div>
				{team.additionalLocations && team.additionalLocations.length > 0 && (
					<div className={styles.factGroup}>
						<dt>Also rides in</dt>
						<dd>{formatList(team.additionalLocations)}</dd>
					</div>
				)}
				{team.affiliation && (
					<div className={styles.factGroup}>
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
					</div>
				)}
				<div className={styles.factGroup}>
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
				</div>
				{team.website && (
					<div className={styles.factGroup}>
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
					</div>
				)}
				{hasSocial && (
					<div className={styles.factGroup}>
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
					</div>
				)}
			</dl>
		</div>
	);

	const rideDetails = (
		<DetailSection title='Ride details'>
			{team.ride && (
				<DetailRow
					label='Schedule'
					value={
						<>
							<RideSchedule ride={team.ride} />
							{team.ride.details && (
								<span className={styles.rideDetails}>{team.ride.details}</span>
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

			{!parsedRouteLink && (
				<>
					<DetailRow
						label='Typical distance'
						value={formatDistance(team.typicalDistanceMiles)}
					/>

					<DetailRow
						label='Typical elevation gain'
						value={formatElevation(team.typicalElevationGainFt)}
					/>
				</>
			)}
			<DetailRow label='Drop / no-drop' value={team.dropPolicy} />
			{team.segmentation ?
				<DetailRow label='Segmentation' value={team.segmentation} />
			: team.pace ?
				<DetailRow label='Ride pace' value={team.pace} />
			:	null}
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
	);

	const rideSummary = team.additionalRideDetails && (
		<DetailSection title='Ride summary'>
			<div className={styles.longText}>
				{team.additionalRideDetails.split(/\n{2,}/).map((paragraph, index) => (
					<p key={index}>{paragraph}</p>
				))}
			</div>
		</DetailSection>
	);

	if (hasMap) {
		return (
			<div className={styles.body}>
				<aside className={styles.aside}>
					{joinCard}
					{contactCard}
					{moreRides}
				</aside>

				<div className={styles.main}>
					{parsedRouteLink && (
						<RouteSection route={parsedRouteLink} teamName={team.name} />
					)}
					{rideDetails}
					{rideSummary}
					<TeamMedia media={team.media ?? []} teamName={team.name} />
				</div>
			</div>
		);
	}

	return (
		<div
			className={`${styles.body} ${styles.noMapBody} ${hasSide ? styles.noMapWithSide : ''}`}
		>
			{hasSide && (
				<div className={`${styles.areaSide} ${styles.main}`}>
					{joinCard}
					{moreRides}
				</div>
			)}

			<div className={`${styles.areaMain} ${styles.main}`}>
				{routePrompt}
				{rideDetails}
				{rideSummary}
				<TeamMedia media={team.media ?? []} teamName={team.name} />
			</div>

			{contactCard}
		</div>
	);
}
