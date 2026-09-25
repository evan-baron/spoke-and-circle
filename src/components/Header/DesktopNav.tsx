// Library imports
import React from 'react';
import Link from 'next/link';

// Component imports
import Logo from '@/components/Logo/Logo';

// Styles imports
import styles from './header.module.scss';

interface DesktopNavProps {
	user: {
		name?: string | null;
		email?: string | null;
		isAdmin?: boolean;
	} | null;
}

const DesktopNav = ({ user }: DesktopNavProps) => {
	return (
		<nav className={styles.desktop}>
			<Logo />
			<div className={styles.navLinks}>
				{user && user.isAdmin && (
					<Link href='/admin' className={styles.navAdmin}>
						Admin Console
					</Link>
				)}
				<Link href='/search' className={styles.navLink}>
					Browse
				</Link>
				{user ?
					<>
						<p className={styles.navLink}>{user.name || user.email}</p>

						<a href='/auth/logout' className={styles.navLink}>
							Log out
						</a>
					</>
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
