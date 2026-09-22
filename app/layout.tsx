import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Header from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import './reset.css';
import './globals.scss';

const jakarta = Plus_Jakarta_Sans({
	subsets: ['latin'],
	variable: '--font-jakarta',
});

export const metadata: Metadata = {
	title: 'Spoke & Circle | Find your bike team',
	description:
		'Search sample bike teams, clubs, and groups by location, type, or keyword.',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='en' className={jakarta.variable}>
			<body>
				<Header />
				<main>{children}</main>
				<Footer />
			</body>
		</html>
	);
}
