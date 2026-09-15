import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';

import styles from './header.module.scss';

const Header = () => {
	return (
		<header className={styles.header}>
			<DesktopNav />
			<MobileNav />
		</header>
	);
};

export default Header;
