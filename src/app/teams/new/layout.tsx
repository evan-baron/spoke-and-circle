import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Submit Your Cycling Team or Group Ride',
	description:
		'Add your cycling team, club, or group ride to Spoke & Circle so riders in your area can find you. Submissions are reviewed before they go live.',
	alternates: { canonical: '/teams/new' },
};

export default function NewTeamLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
