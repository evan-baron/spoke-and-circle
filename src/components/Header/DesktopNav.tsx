// Library imports
import React from 'react';
import Link from 'next/link';

// Component imports
import Logo from '@/components/Logo/Logo';
import AdminNavLink from './AdminNavLink';

// Styles imports
import styles from './header.module.scss';

interface DesktopNavProps {
	user: {
		name?: string | null;
		firstName?: string | null;
		email?: string | null;
		isAdmin?: boolean;
		pendingCount?: number;
	} | null;
}

const DesktopNav = ({ user }: DesktopNavProps) => {
	return (
		<nav className={styles.desktop}>
			<Logo />
			<div className={styles.navLinks}>
				{user && (
					<p className={styles.welcome}>
						Welcome, {user.firstName || user.name?.split(' ')[0] || user.email}
					</p>
				)}
				{user && user.isAdmin && (
					<AdminNavLink initialCount={user.pendingCount} />
				)}
				{user && !user.isAdmin && (
					<Link href='/dashboard' className={styles.navLink}>
						My Teams
					</Link>
				)}
				<Link href='/about' className={styles.navLink}>
					About
				</Link>
				<Link href='/search' className={styles.navLink}>
					Browse
				</Link>
				{user ?
					<a href='/auth/logout' className={styles.navLink}>
						Log out
					</a>
				:	<a href='/auth/login' className={styles.navLink}>
						Log in
					</a>
				}
				{!user && (
					<Link href='/get-started' className={styles.navCta}>
						Get Started
					</Link>
				)}
			</div>
		</nav>
	);
};

export default DesktopNav;
