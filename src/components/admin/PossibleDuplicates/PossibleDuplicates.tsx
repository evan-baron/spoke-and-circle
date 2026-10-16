import Link from 'next/link';
import { teamPath } from '@/lib/teamPaths';
import type { PossibleDuplicate } from '@/services/duplicateService';
import styles from './possibleDuplicates.module.scss';

interface PossibleDuplicatesProps {
	matches: PossibleDuplicate[];
}

function describeMatch(match: PossibleDuplicate): string {
	const shared = match.matchedOn.filter((item) => item !== 'name');
	const parts = [
		...(shared.length > 0 ? [`Same ${shared.join(', ').toLowerCase()}`] : []),
		...(match.matchedOn.includes('name') ? ['Similar name'] : []),
	];
	return parts.join(' · ');
}

export function PossibleDuplicates({ matches }: PossibleDuplicatesProps) {
	return (
		<ul className={styles.list}>
			{matches.map((match) => (
				<li key={match.id} className={styles.item}>
					<Link
						href={
							match.status === 'Pending' ?
								`/admin/pending/${match.id}`
							:	teamPath(match)
						}
						target='_blank'
						rel='noopener noreferrer'
						className={styles.link}
					>
						{match.name} &#8599;
					</Link>
					<span className={styles.detail}>
						{match.type} &middot; {match.location}
					</span>
					<span className={styles.detail}>
						{describeMatch(match)}
						{match.status === 'Pending' && ' · still pending'}
						{match.sameSubmitter && ' · same submitter'}
					</span>
				</li>
			))}
		</ul>
	);
}
