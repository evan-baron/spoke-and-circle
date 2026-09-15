// Library imports
import React from 'react';

// Component imports
import Logo from '@/components/Logo/Logo';

// Styles imports
import styles from './header.module.scss';

const MobileNav = () => {
	return (
		<nav className={styles.mobile}>
			<Logo />
		</nav>
	);
};

export default MobileNav;
