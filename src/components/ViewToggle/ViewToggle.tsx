import Link from 'next/link';
import { toQueryString, type RawSearchParams } from '@/lib/searchParams';
import styles from './viewToggle.module.scss';

interface ViewToggleProps {
	basePath: string;
	searchParams: RawSearchParams;
	view: 'list' | 'calendar';
}

function hrefFor(
	basePath: string,
	searchParams: RawSearchParams,
	view: 'list' | 'calendar',
): string {
	const { page: _page, view: _view, month: _month, ...rest } = searchParams;
	const query = toQueryString(
		view === 'calendar' ? { ...rest, view: 'calendar' } : rest,
	);
	return query ? `${basePath}?${query}` : basePath;
}

export function ViewToggle({ basePath, searchParams, view }: ViewToggleProps) {
	return (
		<nav className={styles.toggle} aria-label='Results view'>
			{(['list', 'calendar'] as const).map((option) => (
				<Link
					key={option}
					href={hrefFor(basePath, searchParams, option)}
					className={`${styles.option} ${view === option ? styles.current : ''}`}
					aria-current={view === option ? 'page' : undefined}
					scroll={false}
				>
					{option === 'list' ? 'List' : 'Calendar'}
				</Link>
			))}
		</nav>
	);
}
