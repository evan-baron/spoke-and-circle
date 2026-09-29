import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchForm } from '@/components/SearchForm/SearchForm';
import { countApprovedTeams } from '@/services/teamService';
import Crank from '@/components/Graphics/Crank';
import { SITE_NAME } from '@/lib/siteConfig';
import styles from './page.module.scss';

const QUICK_LINKS = [
	{ label: 'Gravel', href: '/search?q=gravel' },
	{ label: 'Women only', href: '/search?q=women' },
	{ label: 'Virtual / Zwift', href: '/search?q=virtual' },
	{ label: 'Beginner-friendly', href: '/search?q=beginner-friendly' },
	{
		label: 'Competitive racing teams',
		href: '/search?type=Team&q=competitive',
	},
	{ label: 'No-drop', href: '/search?q=no-drop' },
];

const LISTING_DETAILS = [
	{
		title: `Who it's for`,
		copy: 'Pace, skill level, and the kind of riding.',
	},
	{ title: 'When and where', copy: 'Schedule and meeting details.' },
	{ title: 'What it takes', copy: 'Membership requirements, spelled out.' },
	{ title: 'How to join', copy: 'Who to contact and what to do next.' },
];

export const metadata: Metadata = {
	title: { absolute: 'Spoke & Circle | Cycling Team & Group Ride Finder' },
	alternates: { canonical: '/' },
};

export default async function HomePage() {
	const approvedCount = await countApprovedTeams();
	const teamCount = () => {
		const length = approvedCount;

		if (length < 50) {
			return '';
		}

		if (length < 100) {
			const rounded = Math.floor(length / 10) * 10;
			return `${rounded}+`;
		}

		if (length < 1000) {
			const rounded = Math.floor(length / 100) * 100;
			return `over ${rounded}+`;
		}

		if (length >= 1000) {
			const rounded = Math.floor(length / 1000) * 1000;
			return `over ${rounded}+`;
		}
	};

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
						<span className={styles.heroH1Highlight}>cycling team</span>,{' '}
						<span className={styles.heroH1Highlight}>club</span>, or{' '}
						<span className={styles.heroH1Highlight}>group ride</span> that
						matches your cadence.
					</h1>
					<p className={styles.heroCopy}>
						Whether you race, ride no-drop on Saturdays, or just enjoy a casual
						end-of-day spin, you can search {teamCount()} teams, clubs, group
						rides, and more by keyword, location, or type.
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
					<div className={styles.quickLinks}>
						<span className={styles.quickLinksLabel}>Try:</span>
						{QUICK_LINKS.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className={styles.quickLink}
							>
								{link.label}
							</Link>
						))}
					</div>
				</div>
			</section>

			<section className={styles.explainer}>
				<div className={styles.explainerGrid}>
					<div className={styles.explainerCard}>
						<span className={styles.explainerNumber}>01</span>
						<h3>Search</h3>
						<p>
							Filter by keyword, location, or club type. Every combination is a
							URL you can send.
						</p>
					</div>
					<div className={styles.explainerCard}>
						<span className={styles.explainerNumber}>02</span>
						<h3>Compare</h3>
						<p>
							Scan pace, skill level, schedule, and membership details side by
							side in one table.
						</p>
					</div>
					<div className={styles.explainerCard}>
						<span className={styles.explainerNumber}>03</span>
						<h3>Join</h3>
						<p>
							Open a team&rsquo;s full profile for mission, requirements, and
							exactly how to join.
						</p>
					</div>
				</div>
			</section>

			<section className={styles.why}>
				<div className={styles.whyInner}>
					<div className={styles.whyText}>
						<p className={styles.whyLabel}>Why {SITE_NAME}</p>
						<h2>Great rides shouldn&rsquo;t be a secret.</h2>
						<p>
							Nearly every town has a team, club, or group ride. Finding it
							usually means knowing someone who already rides, or digging
							through old websites and social pages.
						</p>
						<p>
							{SITE_NAME} puts them in one searchable place, with the details
							that matter and a clear way to get in touch.
						</p>
						<Link href='/about' className={styles.whyLink}>
							Read our story &rarr;
						</Link>
					</div>
					<div className={styles.whyCard}>
						<h3>Every listing tells you</h3>
						<ul className={styles.whyList}>
							{LISTING_DETAILS.map((item) => (
								<li key={item.title}>
									<strong>{item.title}</strong>
									<span>{item.copy}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</section>

			<section className={styles.organizers}>
				<div className={styles.organizersInner}>
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
			</section>
		</>
	);
}
