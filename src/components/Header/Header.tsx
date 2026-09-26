import { auth0 } from '@/lib/auth0';
import { getCurrentUser } from '@/services/currentUserService';
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';

import styles from './header.module.scss';

const Header = async () => {
	const session = await auth0.getSession();
	const currentUser = await getCurrentUser();

	const user =
		session?.user ?
			{
				name: session.user.name,
				firstName: currentUser?.firstName ?? session.user.given_name ?? null,
				email: session.user.email,
				isAdmin: currentUser?.isAdmin ?? false,
			}
		:	null;

	return (
		<header className={styles.header}>
			<DesktopNav user={user} />
			<MobileNav user={user} />
		</header>
	);
};

export default Header;
