import type { Metadata } from 'next';
import { Domine } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import Header from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import './reset.css';
import './globals.scss';

const domine = Domine({
	subsets: ['latin'],
	variable: '--font-domine',
});

export const metadata: Metadata = {
	title: 'Spoke & Circle — Find your bike team',
	description:
		'Search sample bike teams, clubs, and groups by location, type, or keyword.',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='en' className={domine.variable}>
			<body>
				<AuthProvider>
					<Header />
					<main>{children}</main>
					<Footer />
				</AuthProvider>
			</body>
		</html>
	);
}
