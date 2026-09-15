// Library imports
import React from 'react';

// Component imports
import Logo from '@/components/Logo/Logo';

// Styles imports
import styles from './header.module.scss';

const DesktopNav = () => {
	return (
		<nav className={styles.desktop}>
			<Logo />
		</nav>
	);
};

export default DesktopNav;
