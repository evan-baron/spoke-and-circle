// Library imports
import React from 'react';

// Styles imports
import styles from './logo.module.scss';

const Logo = () => {
	return (
		<div className={styles.logo}>
			<span className={styles.left}>Spoke</span>
			<span className={styles.and}>&</span>
			<span className={styles.right}>Circle</span>
		</div>
	);
};

export default Logo;
