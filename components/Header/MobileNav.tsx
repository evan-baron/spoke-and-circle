// Library imports
import React from 'react';
import Link from 'next/link';

// Component imports
import Logo from '@/components/Logo/Logo';

// Styles imports
import styles from './header.module.scss';

interface MobileNavProps {
	user: { name?: string | null; email?: string | null } | null;
}

const MobileNav = ({ user }: MobileNavProps) => {
	return (
		<nav className={styles.mobile}>
			<Logo />
			<div className={styles.mobileLinks}>
				{user ?
					<a href='/auth/logout' className={styles.navLink}>
						Log out
					</a>
				:	<a href='/auth/login' className={styles.navLink}>
						Log in
					</a>
				}
				<Link href='/get-started' className={styles.navCta}>
					Get Started
				</Link>
			</div>
		</nav>
	);
};

export default MobileNav;
