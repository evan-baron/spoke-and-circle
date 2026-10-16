'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LocationInput } from '@/components/ui/LocationInput/LocationInput';
import { trackEvent } from '@/lib/analytics';
import { bikeType, clubType } from '@/lib/enums';
import { DEFAULT_RADIUS_MILES, RADIUS_OPTIONS } from '@/lib/searchParams';
import styles from './searchForm.module.scss';

type SearchMode = 'groups' | 'rides';

interface SearchFormProps {
	defaultQ?: string;
	defaultLocation?: string;
	defaultType?: string;
	defaultMode?: SearchMode;
	defaultRadius?: number;
	defaultDiscipline?: string;
	action?: string;
	lockMode?: SearchMode;
	formName?: string;
	onGradient?: boolean;
}

const RADIUS_HINT_MS = 3000;
const TYPE_OPTIONS = clubType.labels.filter((label) => label !== 'Group Ride');
const DISCIPLINE_OPTIONS = bikeType.labels;

export function SearchForm({
	defaultQ = '',
	defaultLocation = '',
	defaultType = '',
	defaultMode = 'groups',
	defaultRadius = DEFAULT_RADIUS_MILES,
	defaultDiscipline = '',
	action = '/search',
	lockMode,
	formName = 'home_search',
	onGradient = false,
}: SearchFormProps) {
	const [mode, setMode] = useState<SearchMode>(lockMode ?? defaultMode);
	const [location, setLocation] = useState(defaultLocation);
	const [radiusHintOpen, setRadiusHintOpen] = useState(false);
	const radiusDisabled = !location.trim();

	useEffect(() => {
		if (!radiusHintOpen) return;
		const timer = setTimeout(() => setRadiusHintOpen(false), RADIUS_HINT_MS);
		return () => clearTimeout(timer);
	}, [radiusHintOpen]);

	return (
		<form
			action={action}
			method='GET'
			onSubmit={() =>
				trackEvent('search_submit', {
					form: formName,
					search_mode: mode === 'rides' ? 'group_ride' : 'team_club',
				})
			}
			className={`${styles.form} ${onGradient ? styles.onGradient : ''}`}
		>
			{!lockMode && (
				<fieldset className={styles.modeGroup}>
					<legend className={styles.modeLegend}>
						I&rsquo;m looking for a&hellip;
					</legend>
					<label className={styles.modeOption}>
						<input
							type='radio'
							value='groups'
							checked={mode === 'groups'}
							onChange={() => setMode('groups')}
						/>
						<span className={styles.modeRadio} />
						Team, Club, or something similar
					</label>
					<label className={styles.modeOption}>
						<input
							type='radio'
							value='rides'
							checked={mode === 'rides'}
							onChange={() => setMode('rides')}
						/>
						<span className={styles.modeRadio} />
						Group ride
					</label>
				</fieldset>
			)}
			{mode === 'rides' && (
				<input type='hidden' name='type' value='Group Ride' />
			)}
			<div className={styles['search-fields']}>
				{mode === 'groups' && (
					<div className={`${styles.field} ${styles.fieldWide}`}>
						<label htmlFor='q' className={styles.label}>
							Keyword
						</label>
						<input
							id='q'
							name='q'
							type='text'
							defaultValue={defaultQ}
							placeholder='e.g. Gravel, Women Only, No-drop&hellip;'
							className={styles.input}
						/>
					</div>
				)}
				<div className={styles.field}>
					<label htmlFor='location' className={styles.label}>
						Location
					</label>
					<LocationInput
						id='location'
						name='location'
						defaultValue={defaultLocation}
						onValueChange={setLocation}
						placeholder='City or ZIP code'
						includeZip
						allowFreeText
						inputClassName={styles.input}
					/>
				</div>
				{mode === 'rides' ?
					<div className={styles.field}>
						<label htmlFor='radius' className={styles.label}>
							Distance
						</label>
						<div className={styles.selectWrap}>
							<select
								id='radius'
								name='radius'
								defaultValue={String(defaultRadius)}
								disabled={radiusDisabled}
								className={styles.input}
							>
								{RADIUS_OPTIONS.map((option) => (
									<option key={option} value={option}>
										Within {option} miles
									</option>
								))}
							</select>
							{radiusDisabled && (
								<span
									aria-hidden='true'
									className={styles.disabledOverlay}
									onClick={() => setRadiusHintOpen(true)}
								/>
							)}
							{radiusDisabled && radiusHintOpen && (
								<span role='status' className={styles.hint}>
									Please enter a location first
								</span>
							)}
						</div>
					</div>
				:	<div className={styles.field}>
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
				}
				{mode === 'rides' && (
					<div className={styles.field}>
						<label htmlFor='bikeType' className={styles.label}>
							Cycling Discipline
						</label>
						<select
							id='bikeType'
							name='bikeType'
							defaultValue={defaultDiscipline}
							className={styles.input}
						>
							<option value=''>Any discipline</option>
							{DISCIPLINE_OPTIONS.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</div>
				)}
				<button type='submit' className={styles.submit}>
					Search
				</button>
			</div>
			{!lockMode && (
				<Link href='/get-started' className={styles.quizLink}>
					Not sure where to start? Take our 30-second quiz &rarr;
				</Link>
			)}
		</form>
	);
}
