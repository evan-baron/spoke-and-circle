'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { CAME_FROM_QUIZ_KEY } from '@/components/GetStartedWizard/GetStartedWizard';
import { CheckboxDropdown } from './CheckboxDropdown';
import styles from './filterBar.module.scss';

interface FilterBarProps {
	defaultQ?: string;
	defaultLocation?: string;
	defaultType?: string;
	defaultBikeTypes?: string[];
	defaultDiscipline?: string;
	defaultSkillLevel?: string;
	defaultCompetitiveOrCasual?: string;
	defaultWomensOnly?: boolean;
	defaultYouthOnly?: boolean;
	defaultAcceptingNewRiders?: boolean;
}

const TYPE_OPTIONS = [
	'Team',
	'Club',
	'Group Ride',
	'Youth Program',
	'Organization',
];
const BIKE_TYPE_OPTIONS = [
	'Road',
	'Gravel',
	'MTB',
	'Track',
	'Tri',
	'E-bike',
	'Mixed',
];
const DISCIPLINE_OPTIONS = [
	'Cross-country',
	'Trail',
	'Enduro',
	'Downhill',
	'All-mountain',
];
const SKILL_LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const RACING_OPTIONS = ['Competitive', 'Casual'];

const AUTO_SUBMIT_DEBOUNCE_MS = 300;
const pendingAutoSubmits = new WeakMap<
	HTMLFormElement,
	ReturnType<typeof setTimeout>
>();

function autoSubmit(event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) {
	const form = event.currentTarget.form;
	if (!form) return;

	const pending = pendingAutoSubmits.get(form);
	if (pending) clearTimeout(pending);

	pendingAutoSubmits.set(
		form,
		setTimeout(() => {
			pendingAutoSubmits.delete(form);
			form.requestSubmit();
		}, AUTO_SUBMIT_DEBOUNCE_MS),
	);
}

export function FilterBar({
	defaultQ = '',
	defaultLocation = '',
	defaultType = '',
	defaultBikeTypes = [],
	defaultDiscipline = '',
	defaultSkillLevel = '',
	defaultCompetitiveOrCasual = '',
	defaultWomensOnly = false,
	defaultYouthOnly = false,
	defaultAcceptingNewRiders = false,
}: FilterBarProps) {
	const activeFilterCount =
		[
			defaultType,
			defaultDiscipline,
			defaultSkillLevel,
			defaultCompetitiveOrCasual,
		].filter(Boolean).length +
		defaultBikeTypes.length +
		(defaultWomensOnly ? 1 : 0) +
		(defaultYouthOnly ? 1 : 0) +
		(defaultAcceptingNewRiders ? 1 : 0);

	// Below $bp-md this also gates .typeBikeGroup and .moreFilters (both
	// collapsed unless open); at $bp-md and up neither ever collapses, so
	// this state only matters on mobile. Starts open if filters already came
	// in via the URL, so they aren't hidden from view on arrival.
	const [filtersOpen, setFiltersOpen] = useState(activeFilterCount > 0);
	const openClass = filtersOpen ? styles.open : '';

	// Exception to the above: results reached via the get-started quiz
	// already reflect answers the rider just gave, so don't immediately
	// re-confront them with the filters panel open too. Corrected after
	// mount (not in the useState initializer) since sessionStorage isn't
	// available during the server render. One-time flag — cleared right
	// after reading so a later reload/share of this URL isn't affected.
	useEffect(() => {
		try {
			if (sessionStorage.getItem(CAME_FROM_QUIZ_KEY) === 'true') {
				sessionStorage.removeItem(CAME_FROM_QUIZ_KEY);
				setFiltersOpen(false);
			}
		} catch {
			// sessionStorage unavailable (private browsing, etc.) — ignore
		}
	}, []);

	return (
		<form action='/search' method='GET' className={styles.form}>
			<input
				name='q'
				type='text'
				defaultValue={defaultQ}
				placeholder='Keyword&hellip;'
				aria-label='Keyword'
				className={`${styles.input} ${styles.keywordInput}`}
			/>
			<input
				name='location'
				type='text'
				defaultValue={defaultLocation}
				placeholder='Location&hellip;'
				aria-label='Location'
				className={`${styles.input} ${styles.locationInput}`}
			/>

			<button
				type='button'
				className={styles.filtersToggle}
				aria-expanded={filtersOpen}
				aria-controls='filter-panel'
				onClick={() => setFiltersOpen((open) => !open)}
			>
				<span>More Filters</span>
				{activeFilterCount > 0 && (
					<span className={styles.filtersCount}>{activeFilterCount}</span>
				)}
				<span className={styles.filtersCaret} aria-hidden='true'>
					&#9662;
				</span>
			</button>

			{/* Collapsed on mobile until "Filters" is tapped (or already open,
          because filters came in via the URL). On desktop this wrapper
          becomes display:contents so type/bike-type rejoin the primary
          row instead of sitting inside the mobile-only collapse group. */}
			<div className={`${styles.typeBikeGroup} ${openClass}`}>
				<select
					name='type'
					defaultValue={defaultType}
					aria-label='Type'
					onChange={autoSubmit}
					className={`${styles.input} ${styles.typeSelect}`}
				>
					<option value=''>Any type</option>
					{TYPE_OPTIONS.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
				<CheckboxDropdown
					name='bikeType'
					label='Any bike type'
					options={BIKE_TYPE_OPTIONS}
					defaultValues={defaultBikeTypes}
				/>
			</div>

			<div id='filter-panel' className={`${styles.moreFilters} ${openClass}`}>
				<div className={styles.filterGrid}>
					<select
						name='skillLevel'
						defaultValue={defaultSkillLevel}
						aria-label='Skill level'
						onChange={autoSubmit}
						className={styles.input}
					>
						<option value=''>Any skill level</option>
						{SKILL_LEVEL_OPTIONS.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
					<select
						name='competitiveOrCasual'
						defaultValue={defaultCompetitiveOrCasual}
						aria-label='Racing or recreational'
						onChange={autoSubmit}
						className={styles.input}
					>
						<option value=''>Racing or recreational</option>
						{RACING_OPTIONS.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
					<select
						name='discipline'
						defaultValue={defaultDiscipline}
						aria-label='Riding style'
						onChange={autoSubmit}
						className={styles.input}
					>
						<option value=''>Any riding style</option>
						{DISCIPLINE_OPTIONS.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</div>

				<div className={styles.toggleRow}>
					<label className={styles.toggle}>
						<input
							type='checkbox'
							name='womensOnly'
							value='true'
							defaultChecked={defaultWomensOnly}
							onChange={autoSubmit}
						/>
						<span>Women&rsquo;s groups</span>
					</label>
					<label className={styles.toggle}>
						<input
							type='checkbox'
							name='youthOnly'
							value='true'
							defaultChecked={defaultYouthOnly}
							onChange={autoSubmit}
						/>
						<span>Youth programs</span>
					</label>
					<label className={styles.toggle}>
						<input
							type='checkbox'
							name='acceptingNewRiders'
							value='true'
							defaultChecked={defaultAcceptingNewRiders}
							onChange={autoSubmit}
						/>
						<span>Accepting new riders</span>
					</label>
				</div>
			</div>

			{/* Mobile: the final action, below every filter. Desktop: rejoins
          the primary row after bike type (see .searchBtn's `order`). */}
			<button type='submit' className={styles.searchBtn}>
				<svg viewBox='0 0 24 24' width='16' height='16' aria-hidden='true'>
					<circle
						cx='11'
						cy='11'
						r='6.5'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
					/>
					<line
						x1='20'
						y1='20'
						x2='15.8'
						y2='15.8'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
					/>
				</svg>
				<span>Search</span>
			</button>
		</form>
	);
}
