import styles from './footer.module.scss';

export function Footer() {
	return (
		<footer className={styles.footer}>
			<div className={styles.wrap}>
				<p>
					Spoke &amp; Circle — a wireframe. All teams, routes, and rosters shown
					are sample data.
				</p>
			</div>
		</footer>
	);
}
