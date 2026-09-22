import { auth0 } from '@/lib/auth0';
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';

import styles from './header.module.scss';

const Header = async () => {
	const session = await auth0.getSession();
	const user = session?.user ? { name: session.user.name, email: session.user.email } : null;

	return (
		<header className={styles.header}>
			<DesktopNav user={user} />
			<MobileNav user={user} />
		</header>
	);
};

export default Header;
