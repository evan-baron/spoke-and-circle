import Link from 'next/link';
import { SearchForm } from '@/components/SearchForm/SearchForm';
import { getAllTeams } from '@/lib/teams';

const QUICK_LINKS = [
	{ label: 'Gravel', href: '/search?q=gravel' },
	{ label: 'Women only', href: '/search?q=women' },
	{ label: 'Virtual / Zwift', href: '/search?q=virtual' },
	{ label: 'Beginner-friendly', href: '/search?q=beginner-friendly' },
	{ label: 'Competitive racing teams', href: '/search?type=Team&q=racing' },
	{ label: 'No-drop', href: '/search?q=no-drop' },
];

export default function HomePage() {
	const teamCount = getAllTeams().length;

	return (
		<>
			<section>
				<div>
					<p>A field guide to group rides</p>
					<h1>Find the team that matches your cadence.</h1>
					<p>
						Search {teamCount} sample teams, clubs, and groups by keyword,
						location, or type &mdash; then share the exact results with a link.
					</p>
					<div>
						<SearchForm />
					</div>
					<div>
						<span>Try:</span>
						{QUICK_LINKS.map((link) => (
							<Link key={link.href} href={link.href}>
								{link.label}
							</Link>
						))}
					</div>
				</div>
			</section>

			<section>
				<div>
					<div>
						<span>01</span>
						<h3>Search</h3>
						<p>
							Filter by keyword, location, or club type. Every combination is a
							URL you can send.
						</p>
					</div>
					<div>
						<span>02</span>
						<h3>Compare</h3>
						<p>
							Scan pace, skill level, schedule, and membership details side by
							side in one table.
						</p>
					</div>
					<div>
						<span>03</span>
						<h3>Join</h3>
						<p>
							Open a team&rsquo;s full profile for mission, requirements, and
							exactly how to join.
						</p>
					</div>
				</div>
			</section>
		</>
	);
}
