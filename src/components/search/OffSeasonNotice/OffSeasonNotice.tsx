import Link from 'next/link';
import { toQueryString, type RawSearchParams } from '@/lib/searchParams';
import styles from './offSeasonNotice.module.scss';

interface OffSeasonNoticeProps {
	basePath: string;
	searchParams: RawSearchParams;
	offSeasonCount: number;
	includeOffSeason: boolean;
}

function hrefFor(
	basePath: string,
	searchParams: RawSearchParams,
	includeOffSeason: boolean,
): string {
	const { page: _page, offSeason: _offSeason, ...rest } = searchParams;
	const query = toQueryString(
		includeOffSeason ? { ...rest, offSeason: 'true' } : rest,
	);
	return query ? `${basePath}?${query}` : basePath;
}

export function OffSeasonNotice({
	basePath,
	searchParams,
	offSeasonCount,
	includeOffSeason,
}: OffSeasonNoticeProps) {
	if (offSeasonCount === 0) return null;

	return (
		<p className={styles.notice}>
			{includeOffSeason ?
				<>
					Including rides that are off-season right now.{' '}
					<Link
						href={hrefFor(basePath, searchParams, false)}
						className={styles.link}
					>
						Hide them
					</Link>
				</>
			:	<>
					{offSeasonCount} more {offSeasonCount === 1 ? 'ride is' : 'rides are'}{' '}
					off-season right now.{' '}
					<Link
						href={hrefFor(basePath, searchParams, true)}
						className={styles.link}
					>
						Show them
					</Link>
				</>
			}
		</p>
	);
}
