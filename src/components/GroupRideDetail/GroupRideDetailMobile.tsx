import Link from 'next/link';
import {
	BikeIcon,
	CalendarIcon,
	ClockIcon,
	LinkIcon,
	MailIcon,
	PhoneIcon,
} from '@/components/ContactIcons/ContactIcons';
import {
	DetailRow,
	DetailSection,
} from '@/components/DetailSection/DetailSection';
import { RouteSection } from '@/components/RouteSection/RouteSection';
import {
	formatDistance,
	formatElevation,
	formatList,
	formatRideDates,
	formatRideTime,
	formatYesNo,
} from '@/lib/format';
import { formatInstagramHandle } from '@/lib/instagram';
import type { ParsedRouteLink } from '@/lib/routeLink';
import { formatTimeZoneLabel } from '@/lib/timeZone';
import type { Team } from '@/lib/types';
import styles from './groupRideDetailMobile.module.scss';

interface GroupRideDetailMobileProps {
	team: Team;
	parsedRouteLink: ParsedRouteLink | null;
}

interface IconRowProps {
	icon: React.ReactNode;
	label: string;
	children: React.ReactNode;
}

function IconRow({ icon, label, children }: IconRowProps) {
	return (
		<div className={styles.iconRow}>
			{icon}
			<div className={styles.iconText}>
				<span className={styles.srOnly}>{label}</span>
				{children}
			</div>
		</div>
	);
}

function stripProtocol(url: string) {
	return url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
}

export function GroupRideDetailMobile({
	team,
	parsedRouteLink,
}: GroupRideDetailMobileProps) {
	const { ride } = team;
	const rideTime = ride ? formatRideTime(ride) : null;
	const timeZoneLabel = formatTimeZoneLabel(team.timeZone);
	const { email, phone } = team.contact;
	const showRouteFields = !parsedRouteLink;
	const summary = [
		ride?.details,
		team.scheduleNotes,
		team.additionalRideDetails,
	].filter(Boolean) as string[];

	const socials = [
		team.social.instagram && {
			label: 'Instagram',
			text: formatInstagramHandle(team.social.instagram),
			href: team.social.instagramLink,
		},
		team.social.facebook && {
			label: 'Facebook',
			text: team.social.facebook,
			href: team.social.facebookLink,
		},
		team.social.strava && { label: 'Strava', text: team.social.strava },
		team.social.discord && { label: 'Discord', text: team.social.discord },
	].filter(Boolean) as { label: string; text: string; href?: string }[];

	return (
		<div className={styles.mobile}>
			{parsedRouteLink && (
				<RouteSection route={parsedRouteLink} teamName={team.name} />
			)}

			<DetailSection title='Ride Details'>
				{rideTime && (
					<IconRow icon={<ClockIcon size={20} />} label='Time of ride'>
						{timeZoneLabel ? `${rideTime} ${timeZoneLabel}` : rideTime}
					</IconRow>
				)}
				{ride && (
					<IconRow icon={<CalendarIcon size={20} />} label='Dates of rides'>
						{formatRideDates(ride)}
					</IconRow>
				)}
				{showRouteFields && team.routeLink && (
					<IconRow icon={<LinkIcon size={20} />} label='Route link'>
						<a
							target='_blank'
							rel='noopener noreferrer nofollow'
							href={team.routeLink}
							className={styles.link}
						>
							{stripProtocol(team.routeLink)}
						</a>
					</IconRow>
				)}
				{team.bikeTypes.length > 0 && (
					<IconRow icon={<BikeIcon size={20} />} label='Cycling disciplines'>
						{formatList(team.bikeTypes)}
					</IconRow>
				)}
				<DetailRow
					label='E-bike allowed'
					value={formatYesNo(team.eBikeAllowed)}
				/>
				{showRouteFields && team.typicalDistanceMiles > 0 && (
					<DetailRow
						label='Typical distance'
						value={formatDistance(team.typicalDistanceMiles)}
					/>
				)}
				{showRouteFields && team.typicalElevationGainFt > 0 && (
					<DetailRow
						label='Typical elevation gain'
						value={formatElevation(team.typicalElevationGainFt)}
					/>
				)}
				<DetailRow label='Drop / no-drop' value={team.dropPolicy} />
				{team.segmentation && (
					<DetailRow label='Segmentation' value={team.segmentation} />
				)}
				{summary.length > 0 && (
					<div className={styles.fullRow}>
						<DetailRow
							label='Ride summary'
							value={
								<div className={styles.summary}>
									{summary.map((paragraph, index) => (
										<p key={index}>{paragraph}</p>
									))}
								</div>
							}
						/>
					</div>
				)}
			</DetailSection>

			<DetailSection title='Contact Info'>
				<DetailRow label='Location' value={team.location} />
				{team.affiliation && (
					<DetailRow
						label='Affiliation'
						value={
							team.affiliatedId ?
								<Link
									href={`/teams/${team.affiliatedId}`}
									className={styles.link}
								>
									{team.affiliation}
								</Link>
							:	team.affiliation
						}
					/>
				)}
				{phone && (
					<IconRow icon={<PhoneIcon size={20} />} label='Phone'>
						<a href={`tel:${phone}`} className={styles.link}>
							{phone}
						</a>
					</IconRow>
				)}
				{email && (
					<IconRow icon={<MailIcon size={20} />} label='Email'>
						<a href={`mailto:${email}`} className={styles.link}>
							{email.split('@')[0]}@<wbr />
							{email.split('@').slice(1).join('@')}
						</a>
					</IconRow>
				)}
				{socials.map(({ label, text, href }) => (
					<DetailRow
						key={label}
						label={label}
						value={
							href ?
								<a
									target='_blank'
									rel='noopener noreferrer'
									href={href}
									className={styles.link}
								>
									{text}
								</a>
							:	text
						}
					/>
				))}
			</DetailSection>
		</div>
	);
}
