import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ResultsTable } from '@/components/search/ResultsTable/ResultsTable';
import styles from '@/app/search/search.module.scss';
import { jsonLdScript } from '@/lib/jsonLd';
import { SITE_NAME } from '@/lib/siteConfig';
import {
	buildBreadcrumbJsonLd,
	buildItemListJsonLd,
} from '@/lib/structuredData';
import { findStateBySlug, stateSlug, type UsState } from '@/lib/usStates';
import {
	getApprovedListingsInState,
	type LandingKind,
} from '@/services/stateLandingService';

const COPY = {
	teams: {
		basePath: '/teams/in',
		noun: 'cycling teams and clubs',
		heading: (state: string) => `Cycling teams and clubs in ${state}`,
		title: (state: string) => `Cycling Teams & Clubs in ${state}`,
		otherLabel: (state: string) => `Group rides in ${state}`,
		otherPath: '/group-rides/in',
		searchHref: '/search',
	},
	rides: {
		basePath: '/group-rides/in',
		noun: 'group rides',
		heading: (state: string) => `Group rides in ${state}`,
		title: (state: string) => `Group Rides in ${state}`,
		otherLabel: (state: string) => `Cycling teams and clubs in ${state}`,
		otherPath: '/teams/in',
		searchHref: '/group-rides',
	},
} as const;

function resolveState(slug: string): UsState {
	const state = findStateBySlug(slug);
	if (!state) notFound();
	return state;
}

function joinNames(names: string[]): string {
	if (names.length <= 2) return names.join(' and ');
	return `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}`;
}

export async function getStateLandingMetadata(
	kind: LandingKind,
	slug: string,
): Promise<Metadata> {
	const state = resolveState(slug);
	const copy = COPY[kind];
	const listings = await getApprovedListingsInState(state.abbr, kind);
	const path = `${copy.basePath}/${slug}`;
	const title = copy.title(state.name);
	const description = `Browse ${listings.length} ${copy.noun} in ${state.name}. See pace, skill level, how to join, and when they ride.`;

	return {
		title,
		description,
		alternates: { canonical: path },
		robots: { index: listings.length > 0, follow: true },
		openGraph: {
			title,
			description,
			url: path,
			siteName: SITE_NAME,
			locale: 'en_US',
			type: 'website',
		},
	};
}

export async function StateLanding({
	kind,
	slug,
}: {
	kind: LandingKind;
	slug: string;
}) {
	const state = resolveState(slug);
	const copy = COPY[kind];
	const listings = await getApprovedListingsInState(state.abbr, kind);
	const path = `${copy.basePath}/${slug}`;
	const featured = listings.slice(0, 3).map((team) => team.name);

	const structuredData = [
		buildBreadcrumbJsonLd([
			{ name: SITE_NAME, path: '/' },
			{ name: copy.heading(state.name), path },
		]),
		buildItemListJsonLd(copy.heading(state.name), listings),
	];

	return (
		<div className={styles.page}>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: jsonLdScript(structuredData) }}
			/>
			<div className={styles.wrap}>
				<h1>{copy.heading(state.name)}</h1>

				<p className={styles.count}>
					{listings.length > 0 ?
						`${SITE_NAME} lists ${listings.length} ${copy.noun} in ${state.name}, including ${joinNames(featured)}.`
					:	`There are no ${copy.noun} listed in ${state.name} yet.`}
				</p>

				<ResultsTable
					teams={listings}
					isGroupRideSearch={kind === 'rides'}
				/>

				<p>
					<Link href={`${copy.searchHref}?location=${encodeURIComponent(state.name)}`}>
						Search {copy.noun} near a specific city in {state.name}
					</Link>
				</p>
				<p>
					<Link href={`${copy.otherPath}/${stateSlug(state)}`}>
						{copy.otherLabel(state.name)}
					</Link>
				</p>
			</div>
		</div>
	);
}
