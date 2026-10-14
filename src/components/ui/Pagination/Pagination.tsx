import Link from 'next/link';
import type { RawSearchParams } from '@/lib/searchParams';
import styles from './pagination.module.scss';

interface PaginationProps {
	basePath: string;
	searchParams: RawSearchParams;
	page: number;
	pageCount: number;
}

function buildHref(
	basePath: string,
	searchParams: RawSearchParams,
	page: number,
): string {
	const query = new URLSearchParams();
	for (const [key, value] of Object.entries(searchParams)) {
		if (key === 'page' || value === undefined) continue;
		for (const item of Array.isArray(value) ? value : [value]) {
			query.append(key, item);
		}
	}
	if (page > 1) query.set('page', String(page));
	const queryString = query.toString();
	return queryString ? `${basePath}?${queryString}` : basePath;
}

export function Pagination({
	basePath,
	searchParams,
	page,
	pageCount,
}: PaginationProps) {
	if (pageCount <= 1) return null;

	return (
		<nav className={styles.nav} aria-label='Pagination'>
			{page > 1 ?
				<Link
					href={buildHref(basePath, searchParams, page - 1)}
					className={styles.button}
					rel='prev'
				>
					&larr; Previous
				</Link>
			:	<span className={`${styles.button} ${styles.disabled}`} aria-disabled='true'>
					&larr; Previous
				</span>
			}
			<p className={styles.status} aria-live='polite'>
				Page {page} of {pageCount}
			</p>
			{page < pageCount ?
				<Link
					href={buildHref(basePath, searchParams, page + 1)}
					className={styles.button}
					rel='next'
				>
					Next &rarr;
				</Link>
			:	<span className={`${styles.button} ${styles.disabled}`} aria-disabled='true'>
					Next &rarr;
				</span>
			}
		</nav>
	);
}
