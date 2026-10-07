import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchForm } from '@/components/SearchForm/SearchForm';
import Crank from '@/components/Graphics/Crank';
import { Badge } from '@/components/Badge/Badge';
import { SITE_NAME } from '@/lib/siteConfig';
import { formatRideRecurrence } from '@/lib/format';
import type { Team } from '@/lib/types';
import { RIDE_STYLES, getHomeData } from '@/services/homeService';
import styles from './page.module.scss';

const JOIN_STEPS = [
	{ key: 'open', title: 'Open to anyone', copy: 'Show up and ride.' },
	{ key: 'tryouts', title: 'Tryouts', copy: 'Prove your fitness first.' },
	{
		key: 'referral',
		title: 'Referral required',
		copy: 'A current member vouches for you.',
	},
	{
		key: 'inviteOnly',
		title: 'Invite only',
		copy: 'The group picks its riders.',
	},
] as const;

function joinLabel(team: Team): string {
	const { open, tryouts, referralRequired, inviteOnly } = team.joinRequirements;
	if (inviteOnly) return 'Invite only';
	if (referralRequired) return 'Referral required';
	if (tryouts) return 'Tryouts';
	return open ? 'Open to all' : 'See listing';
}

function scheduleLabel(team: Team): string | null {
	const ride = team.rides[0];
	return ride ? formatRideRecurrence(ride) : null;
}

function roundedCount(count: number): string {
	if (count < 50) return '';
	if (count < 100) return `${Math.floor(count / 10) * 10}+ `;
	if (count < 1000) return `over ${Math.floor(count / 100) * 100} `;
	return `over ${Math.floor(count / 1000) * 1000} `;
}

export const metadata: Metadata = {
	title: { absolute: 'Spoke & Circle | Cycling Team & Group Ride Finder' },
	alternates: { canonical: '/' },
};

export default async function HomePage() {
	const data = await getHomeData();

	return (
		<>
			<section className={styles.hero}>
				<div className={styles.graphicContainer}>
					<div className={styles.graphic}>
						<Crank color='white' />
					</div>
				</div>
				<div className={styles.heroInner}>
					<p className={styles.eyebrow}>A field guide to cycling groups</p>
					<h1>
						Find the{' '}
						<span className={styles.heroH1Highlight}>
							cycling club, team, or group ride
						</span>{' '}
						that matches your cadence.
					</h1>
					<p className={styles.heroCopy}>
						Whether you race, ride no-drop on Saturdays, or just enjoy a casual
						end-of-day spin, you can search {roundedCount(data.total)}teams,
						clubs, group rides, and more by keyword, location, or type.
						<br />
						Find <span className={styles.heroCopyHighlight}>your circle</span>.
					</p>
					<div className={styles.searchWrap}>
						<SearchForm onGradient />
						<div className={styles.searchWrapLinks}>
							<Link href='/teams/new' className={styles.submitLink}>
								+ Submit your team, club, or group ride
							</Link>
						</div>
					</div>
				</div>
			</section>

			<div className={styles.bands}>
				<section className={`${styles.band} ${styles.bandBlush}`}>
					<div className={styles.bandInner}>
						<div className={styles.section}>
							<div className={styles.sectionHead}>
								<h2>Browse by how you ride</h2>
								<p>
									Pick the kind of riding you want and see who&rsquo;s doing it.
								</p>
							</div>
							<ul className={styles.tiles}>
								{RIDE_STYLES.map((style, index) => (
									<li key={style.label}>
										<Link href={style.href} className={styles.tile}>
											<span className={styles.tileTitle}>{style.label}</span>
											<span className={styles.tileCopy}>
												{style.description}
											</span>
											<span className={styles.tileCount}>
												{data.rideStyleCounts[index]}{' '}
												{data.rideStyleCounts[index] === 1 ?
													'listing'
												:	'listings'}
											</span>
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
				</section>

				<section className={styles.band}>
					<div className={styles.bandInner}>
						{data.recent.length > 0 && (
							<div className={styles.section}>
								<div className={styles.sectionHead}>
									<h2>Recently added</h2>
									<Link href='/search' className={styles.textLink}>
										Browse all listings &rarr;
									</Link>
								</div>
								<ul className={styles.recent}>
									{data.recent.map((team) => (
										<li key={team.id}>
											<Link
												href={`/teams/${team.id}`}
												className={styles.recentRow}
											>
												<span className={styles.recentMain}>
													<span className={styles.recentName}>{team.name}</span>
													<span className={styles.recentMeta}>
														{team.location}
														{scheduleLabel(team) && (
															<> &middot; {scheduleLabel(team)}</>
														)}
													</span>
												</span>
												<span className={styles.recentBadges}>
													<Badge>{team.type}</Badge>
													<Badge tone='forest'>{joinLabel(team)}</Badge>
												</span>
											</Link>
										</li>
									))}
								</ul>
							</div>
						)}

						{/*
						{data.states.length > 0 && (
							<div className={styles.section}>
								<div className={styles.sectionHead}>
									<h2>Browse by state</h2>
									<p>
										Don&rsquo;t see yours?{' '}
										<Link href='/teams/new' className={styles.textLink}>
											List the first group there
										</Link>
										.
									</p>
								</div>
								<ul className={styles.states}>
									{data.states.map((state) => (
										<li key={state.abbr}>
											<Link
												href={`/search?location=${encodeURIComponent(state.name)}`}
												className={styles.state}
											>
												<span>{state.name}</span>
												<span className={styles.stateCount}>{state.count}</span>
											</Link>
										</li>
									))}
								</ul>
							</div>
						)}
						*/}
					</div>
				</section>

				<section className={`${styles.band} ${styles.bandDark}`}>
					<div className={styles.bandInner}>
						<div className={styles.section}>
							<div className={styles.sectionHead}>
								<h2>Know what it takes before you show up</h2>
								<p>
									Every listing says how you get in, so you&rsquo;re not
									guessing from a Facebook page.
								</p>
							</div>
							<ul className={styles.join}>
								{JOIN_STEPS.map((step) => (
									<li key={step.key} className={styles.joinItem}>
										<span className={styles.joinCount}>
											{data.join[step.key]}
										</span>
										<strong>{step.title}</strong>
										<span>{step.copy}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</section>

				<section className={styles.band}>
					<div className={styles.bandInner}>
						<div className={styles.why}>
							<h2>Why {SITE_NAME}</h2>
							<p>
								Most groups are easy to find if you already know someone who
								rides. {SITE_NAME} puts them in one searchable place, with pace,
								schedule, and how to join on every listing.
							</p>
							<Link href='/about' className={styles.textLink}>
								Read our story &rarr;
							</Link>
						</div>

						<div className={styles.organizers}>
							<div>
								<h2>Run a team, club, or group ride?</h2>
								<p>
									List it for free so riders in your area can find you, see your
									pace and schedule, and know exactly how to join.
								</p>
							</div>
							<Link href='/teams/new' className={styles.organizersCta}>
								Submit your group
							</Link>
						</div>
					</div>
				</section>
			</div>
		</>
	);
}
