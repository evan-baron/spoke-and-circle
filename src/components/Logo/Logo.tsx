// Library imports
import React from 'react';
import Link from 'next/link';

// Styles imports
import styles from './logo.module.scss';

const Logo = () => {
	return (
		<Link href='/' className={styles.logo}>
			<span className={styles.wordmark}>
				<span className={styles.left}>Spoke</span>
				<span className={styles.and}>&amp;</span>
				<span className={styles.right}>Circle</span>
			</span>
		</Link>
	);
};

export default Logo;
