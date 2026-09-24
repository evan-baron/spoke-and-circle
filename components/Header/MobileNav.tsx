// Library imports
import React from 'react';
import Link from 'next/link';

// Component imports
import Logo from '@/components/Logo/Logo';

// Styles imports
import styles from './header.module.scss';

interface MobileNavProps {
	user: {
		name?: string | null;
		email?: string | null;
		isAdmin?: boolean;
	} | null;
}

const MobileNav = ({ user }: MobileNavProps) => {
	return (
		<nav className={styles.mobile}>
			<Logo />
			<div className={styles.mobileLinks}>
				{user ?
					<>
						{user.isAdmin && (
							<Link href='/admin' className={styles.navAdmin}>
								Admin Console
							</Link>
						)}
						<a
							href='/auth/logout'
							className={`${styles.navLink} ${styles.navLinkWithIcon}`}
						>
							<svg
								className={styles.navIcon}
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
								aria-hidden='true'
								focusable='false'
							>
								<path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
								<polyline points='16 17 21 12 16 7' />
								<line x1='21' y1='12' x2='9' y2='12' />
							</svg>
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

export default MobileNav;
