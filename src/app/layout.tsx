import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import AppProviders from '@/app/AppProviders';
import Header from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import {
	getSiteUrl,
	OG_IMAGE_PATH,
	SITE_DESCRIPTION,
	SITE_KEYWORDS,
	SITE_NAME,
	SITE_TITLE,
	SUPPORT_EMAIL,
} from '@/lib/siteConfig';
import { getCurrentUser } from '@/services/currentUserService';
import './reset.css';
import './globals.scss';

const jakarta = Plus_Jakarta_Sans({
	subsets: ['latin'],
	variable: '--font-jakarta',
});

export const metadata: Metadata = {
	metadataBase: new URL(getSiteUrl()),
	title: {
		default: SITE_TITLE,
		template: `%s | ${SITE_NAME}`,
	},
	description: SITE_DESCRIPTION,
	keywords: SITE_KEYWORDS,
	applicationName: SITE_NAME,
	authors: [{ name: SITE_NAME }],
	creator: SITE_NAME,
	publisher: SITE_NAME,
	openGraph: {
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		url: '/',
		siteName: SITE_NAME,
		images: [
			{
				url: OG_IMAGE_PATH,
				width: 1200,
				height: 630,
				alt: `${SITE_NAME}: find cycling teams, clubs, and group rides`,
			},
		],
		locale: 'en_US',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		images: [OG_IMAGE_PATH],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	themeColor: '#402145',
};

const structuredData = [
	{
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: SITE_NAME,
		url: getSiteUrl(),
		description: SITE_DESCRIPTION,
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${getSiteUrl()}/search?q={search_term_string}`,
			},
			'query-input': 'required name=search_term_string',
		},
	},
	{
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: SITE_NAME,
		url: getSiteUrl(),
		email: SUPPORT_EMAIL,
	},
];

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const currentUser = await getCurrentUser();

	return (
		<html lang='en' className={jakarta.variable}>
			<head>
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
				/>
			</head>
			<body>
				<AppProviders currentUser={currentUser}>
					<Header />
					<main>{children}</main>
					<Footer />
				</AppProviders>
			</body>
		</html>
	);
}
