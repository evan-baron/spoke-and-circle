import styles from './searchForm.module.scss';
import Link from 'next/link';

interface SearchFormProps {
	defaultQ?: string;
	defaultLocation?: string;
	defaultType?: string;
	onGradient?: boolean;
}

const TYPE_OPTIONS = [
	'Team',
	'Club',
	'Group Ride',
	'Youth Program',
	'Organization',
];

export function SearchForm({
	defaultQ = '',
	defaultLocation = '',
	defaultType = '',
	onGradient = false,
}: SearchFormProps) {
	return (
		<form
			action='/search'
			method='GET'
			className={`${styles.form} ${onGradient ? styles.onGradient : ''}`}
		>
			<div className={styles['search-fields']}>
				<div className={`${styles.field} ${styles.fieldWide}`}>
					<label htmlFor='q' className={styles.label}>
						Keyword
					</label>
					<input
						id='q'
						name='q'
						type='text'
						defaultValue={defaultQ}
						placeholder='e.g. gravel, women only, no-drop&hellip;'
						className={styles.input}
					/>
				</div>
				<div className={styles.field}>
					<label htmlFor='location' className={styles.label}>
						Location
					</label>
					<input
						id='location'
						name='location'
						type='text'
						defaultValue={defaultLocation}
						placeholder='City or state'
						className={styles.input}
					/>
				</div>
				<div className={styles.field}>
					<label htmlFor='type' className={styles.label}>
						Group Type
					</label>
					<select
						id='type'
						name='type'
						defaultValue={defaultType}
						className={styles.input}
					>
						<option value=''>Any type</option>
						{TYPE_OPTIONS.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</div>
				<button type='submit' className={styles.submit}>
					Search
				</button>
			</div>
			<Link href='/get-started' className={styles.quizLink}>
				Not sure where to start? Take our 30-second quiz &rarr;
			</Link>
		</form>
	);
}
