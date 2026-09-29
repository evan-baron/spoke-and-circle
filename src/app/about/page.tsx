import type { Metadata } from 'next';
import Link from 'next/link';
import Crank from '@/components/Graphics/Crank';
import { SITE_NAME } from '@/lib/siteConfig';
import styles from './about.module.scss';

export const metadata: Metadata = {
	title: 'About Us',
	description: `Why ${SITE_NAME} exists: finding cycling groups, teams, and group rides shouldn't depend on knowing who to ask.`,
	alternates: { canonical: '/about' },
};

const STEPS = [
	{
		title: 'Search',
		copy: 'Browse teams, clubs, and group rides by location, discipline, and skill level.',
	},
	{
		title: 'Reach out',
		copy: 'Every listing points you to the people running it, so you know exactly who to contact.',
	},
	{
		title: 'Ride',
		copy: 'Show up, meet your people, and turn a solo ride into something you look forward to.',
	},
];

export default function AboutPage() {
	return (
		<>
			<section className={styles.hero}>
				<div className={styles.graphicContainer}>
					<div className={styles.graphic}>
						<Crank color='white' />
					</div>
				</div>
				<div className={styles.heroInner}>
					<p className={styles.eyebrow}>About {SITE_NAME}</p>
					<h1>Every cyclist deserves a circle to ride with.</h1>
					<p className={styles.heroCopy}>
						{SITE_NAME} makes it easy to find cycling teams, clubs, and group
						rides near you, whatever your discipline or skill level.
					</p>
				</div>
			</section>

			<div className={styles.body}>
				<section className={styles.section}>
					<p className={styles.label}>The inspiration</p>
					<h2>Great rides shouldn&rsquo;t be a secret.</h2>
					<div className={styles.prose}>
						<p>
							Cycling groups, teams, and group rides are out there in almost
							every town. The hard part is finding them. If you don&rsquo;t
							already know someone who rides, it&rsquo;s tough to know who to
							reach out to, where to look, or whether a group is even a good fit
							for you.
						</p>
						<p>
							Information ends up scattered across old websites, social media
							pages, and word of mouth. Newer riders give up before they find a
							group, and welcoming clubs go unnoticed by the people who would
							love them.
						</p>
						<p>
							{SITE_NAME} fixes that. It puts teams, clubs, and group rides in
							one searchable place, with the details that matter and a clear way
							to get in touch.
						</p>
					</div>
				</section>

				<section className={styles.section}>
					<p className={styles.label}>How it works</p>
					<h2>From curious to clipped in.</h2>
					<ol className={styles.steps}>
						{STEPS.map((step, index) => (
							<li key={step.title} className={styles.step}>
								<span className={styles.stepNumber}>{index + 1}</span>
								<h3>{step.title}</h3>
								<p>{step.copy}</p>
							</li>
						))}
					</ol>
				</section>

				<section className={styles.section}>
					<p className={styles.label}>The creator</p>
					<h2>Built by a rider who knows the feeling.</h2>
					<div className={styles.prose}>
						<p>
							{SITE_NAME} was created by Evan Baron, a former endurance mountain
							bike racer. Racing on a team showed him how much a group of people
							can change the way you ride: the motivation, the shared miles, the
							friends who show up at dawn.
						</p>
						<p>
							Now he&rsquo;s building the tool he wishes every rider had, to
							help cyclists of all skill levels find their circle, whether
							that&rsquo;s a team, a club, a group, or an organization.
						</p>
					</div>
				</section>

				<section className={styles.cta}>
					<h2>Ready to find your people?</h2>
					<p>
						Answer a few quick questions and we&rsquo;ll point you to groups
						that fit, or list your own so riders can find you.
					</p>
					<div className={styles.actions}>
						<Link href='/get-started' className={styles.primary}>
							Find my circle
						</Link>
						<Link href='/teams/new' className={styles.secondary}>
							List your group
						</Link>
					</div>
				</section>
			</div>
		</>
	);
}
