import Link from 'next/link';
import { Fragment } from 'react';
import { Badge } from '@/components/Badge/Badge';
import {
	BikeIcon,
	CalendarIcon,
	ClockIcon,
	MailIcon,
	NoteIcon,
	PhoneIcon,
	WebsiteIcon,
} from '@/components/ContactIcons/ContactIcons';
import {
	DetailRow,
	DetailSection,
} from '@/components/DetailSection/DetailSection';
import { TeamMedia } from '@/components/TeamMedia/TeamMedia';
import {
	formatAgeRequirement,
	formatList,
	formatRideDates,
	formatRideTime,
	formatVerification,
	formatYesNo,
} from '@/lib/format';
import { formatInstagramHandle } from '@/lib/instagram';
import { getRouteEmbed } from '@/lib/routeLink';
import { toneForPace, toneForVerified } from '@/lib/tone';
import type { Team } from '@/lib/types';
import styles from './groupRideDetail.module.scss';

interface GroupRideDetailProps {
	team: Team;
	preview?: boolean;
}

interface GlanceItemProps {
	icon: React.ReactNode;
	label: string;
	labelOnMobileOnly?: boolean;
	children: React.ReactNode;
}

function GlanceItem({
	icon,
	label,
	labelOnMobileOnly = false,
	children,
}: GlanceItemProps) {
	return (
		<li className={styles.glanceItem}>
			{icon}
			<div className={styles.glanceText}>
				<span
					className={
						labelOnMobileOnly ?
							`${styles.glanceLabel} ${styles.glanceLabelMobileOnly}`
						:	styles.glanceLabel
					}
				>
					{label}
				</span>
				<div className={styles.glanceValue}>{children}</div>
			</div>
		</li>
	);
}

function stripProtocol(url: string) {
	return url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
}

export function GroupRideDetail({
	team,
	preview = false,
}: GroupRideDetailProps) {
	const routeEmbed = getRouteEmbed(team.routeLink);
	const showRouteLink = Boolean(team.routeLink) && !routeEmbed;
	const { email, phone } = team.contact;
	const multipleRides = team.rides.length > 1;
	const summary = [
		team.scheduleNotes,
		...(team.additionalRideDetails?.split(/\n{2,}/) ?? []),
	].filter(Boolean) as string[];
	const hasAgeRequirement =
		team.ageRequirement?.min !== undefined ||
		team.ageRequirement?.max !== undefined;
	const hasGlance =
		Boolean(email) ||
		Boolean(phone) ||
		team.rides.length > 0 ||
		team.bikeTypes.length > 0 ||
		summary.length > 0 ||
		showRouteLink;

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
	].filter(Boolean) as { label: string; text: string; href?: string }[];

	return (
		<div className={styles.detail}>
			<header className={styles.header}>
				<div className={styles.badgeRow}>
					<Badge tone='ink'>{team.type}</Badge>
					<Badge tone={toneForPace(team.pace)}>{team.pace}</Badge>
					{team.bikeTypes.map((bikeType) => (
						<Badge key={bikeType} tone='gold'>
							{bikeType}
						</Badge>
					))}
					<Badge tone={toneForVerified(team.verified)}>
						{formatVerification(team.verified, team.lastActiveYear)}
					</Badge>
				</div>
				<h1>{team.name}</h1>
				<p className={styles.subline}>{team.location}</p>
			</header>

			<div
				className={
					routeEmbed ?
						`${styles.layout} ${styles.layoutWithMap}`
					:	styles.layout
				}
			>
				<div className={styles.side}>
					{hasGlance && (
						<DetailSection title='Ride Details' className={styles.orderDetails}>
							<ul className={styles.glanceList}>
								{phone && (
									<GlanceItem
									icon={<PhoneIcon size={18} />}
									label='Phone'
									labelOnMobileOnly
								>
										<a href={`tel:${phone}`} className={styles.phoneLink}>
											{phone}
										</a>
									</GlanceItem>
								)}
								{email && (
									<GlanceItem
									icon={<MailIcon size={18} />}
									label='Email'
									labelOnMobileOnly
								>
										<a href={`mailto:${email}`} className={styles.contactLink}>
											{email.split('@')[0]}@<wbr />
											{email.split('@').slice(1).join('@')}
										</a>
									</GlanceItem>
								)}
								{team.rides.map((ride, index) => {
									const time = formatRideTime(ride);
									const suffix = multipleRides ? ` ${index + 1}` : '';
									return (
										<Fragment key={index}>
											{time && (
												<GlanceItem
													icon={<ClockIcon size={18} />}
													label={`Time of ride${suffix}`}
												>
													{time}
												</GlanceItem>
											)}
											<GlanceItem
												icon={<CalendarIcon size={18} />}
												label={`Dates of rides${suffix}`}
											>
												{formatRideDates(ride)}
												{ride.details && (
													<span className={styles.rideDetails}>{ride.details}</span>
												)}
											</GlanceItem>
										</Fragment>
									);
								})}
								{team.bikeTypes.length > 0 && (
									<GlanceItem
										icon={<BikeIcon size={18} />}
										label='Cycling Discipline(s)'
									>
										{formatList(team.bikeTypes)}
									</GlanceItem>
								)}
								{showRouteLink && team.routeLink && (
									<GlanceItem icon={<WebsiteIcon size={18} />} label='Route link'>
										<a
											target='_blank'
											rel='noopener noreferrer nofollow'
											href={team.routeLink}
											className={styles.website}
										>
											{stripProtocol(team.routeLink)}
										</a>
									</GlanceItem>
								)}
								{summary.length > 0 && (
									<GlanceItem icon={<NoteIcon size={18} />} label='Ride summary'>
										<div className={styles.longText}>
											{summary.map((paragraph, index) => (
												<p key={index}>{paragraph}</p>
											))}
										</div>
									</GlanceItem>
								)}
							</ul>
						</DetailSection>
					)}
				</div>

				<div className={styles.main}>
					{routeEmbed && (
						<DetailSection title='Ride Route' className={styles.orderRoute}>
							<iframe
								src={routeEmbed.src}
								title={`${team.name} route on ${routeEmbed.provider}`}
								loading='lazy'
								sandbox='allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox'
								className={styles.routeFrame}
							/>
						</DetailSection>
					)}

					<DetailSection title='Additional details' className={styles.orderMore}>
						{team.affiliation && (
							<DetailRow
								label='Part of'
								value={
									team.affiliatedId && !preview ?
										<Link
											href={`/teams/${team.affiliatedId}`}
											className={styles.affiliationLink}
										>
											{team.affiliation}
										</Link>
									:	team.affiliation
								}
							/>
						)}
						<DetailRow label='Drop / no-drop' value={team.dropPolicy} />
						<DetailRow
							label='E-bike allowed'
							value={formatYesNo(team.eBikeAllowed)}
						/>
						<DetailRow
							label='Age requirement'
							value={
								hasAgeRequirement ?
									formatAgeRequirement(team.ageRequirement)
								:	'All ages welcome'
							}
						/>
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
											className={styles.website}
										>
											{text}
										</a>
									:	text
								}
							/>
						))}
					</DetailSection>

					<TeamMedia
						media={team.media ?? []}
						teamName={team.name}
						className={styles.orderPhotos}
					/>
				</div>
			</div>
		</div>
	);
}
