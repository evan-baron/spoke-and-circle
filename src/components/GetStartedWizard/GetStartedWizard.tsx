'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { RiderPreferences } from '@/lib/types';
import styles from './getStartedWizard.module.scss';

const DISCIPLINE_OPTIONS: RiderPreferences['disciplines'][number][] = [
	'Road',
	'Gravel',
	'MTB',
	'Track',
	'BMX',
	'Tri',
	'E-bike',
	'Mixed',
];

const SKILL_LEVEL_OPTIONS: NonNullable<RiderPreferences['skillLevel']>[] = [
	'Beginner',
	'Intermediate',
	'Advanced',
	'Expert',
];

const LOOKING_FOR_OPTIONS: NonNullable<RiderPreferences['lookingFor']>[] = [
	'Team',
	'Club',
	'Group Ride',
];

const STEPS = ['zipCode', 'discipline', 'skillLevel', 'lookingFor'] as const;
type StepKey = (typeof STEPS)[number];

// Read (and cleared) by FilterBar on mount: the quiz already asked what the
// rider wants, so /search shouldn't immediately re-confront them with the
// filters panel open, even though the quiz's answers land as active filters.
export const CAME_FROM_QUIZ_KEY = 'cameFromQuiz';

const EMPTY_ANSWERS: RiderPreferences = {
	zipCode: '',
	disciplines: [],
	skillLevel: null,
	lookingFor: null,
};

export function GetStartedWizard() {
	const router = useRouter();
	const [stepIndex, setStepIndex] = useState(0);
	const [answers, setAnswers] = useState<RiderPreferences>(EMPTY_ANSWERS);
	const [direction, setDirection] = useState<'forward' | 'back'>('forward');
	const [zipDraft, setZipDraft] = useState('');
	const [isFinishing, setIsFinishing] = useState(false);

	const step: StepKey = STEPS[stepIndex] ?? STEPS[0];
	const isLastStep = stepIndex === STEPS.length - 1;

	function goTo(index: number, dir: 'forward' | 'back') {
		setDirection(dir);
		setStepIndex(Math.max(0, Math.min(index, STEPS.length - 1)));
	}

	function finish(finalAnswers: RiderPreferences) {
		setIsFinishing(true);

		try {
			window.sessionStorage.setItem(CAME_FROM_QUIZ_KEY, 'true');
		} catch {
			// sessionStorage unavailable (private browsing, etc.) — non-critical
		}

		const params = new URLSearchParams();
		if (finalAnswers.zipCode) params.set('location', finalAnswers.zipCode);
		for (const discipline of finalAnswers.disciplines) {
			params.append('bikeType', discipline);
		}
		if (finalAnswers.skillLevel)
			params.set('skillLevel', finalAnswers.skillLevel);
		if (finalAnswers.lookingFor) params.set('type', finalAnswers.lookingFor);

		router.push(`/search${params.size ? `?${params.toString()}` : ''}`);
	}

	function submitZip() {
		const zipCode = zipDraft.trim();
		setAnswers((prev) => ({ ...prev, zipCode }));
		goTo(stepIndex + 1, 'forward');
	}

	function toggleDiscipline(value: RiderPreferences['disciplines'][number]) {
		setAnswers((prev) => ({
			...prev,
			disciplines:
				prev.disciplines.includes(value) ?
					prev.disciplines.filter((d) => d !== value)
				:	[...prev.disciplines, value],
		}));
	}

	function selectSkillLevel(
		value: NonNullable<RiderPreferences['skillLevel']>,
	) {
		const next = { ...answers, skillLevel: value };
		setAnswers(next);
		window.setTimeout(() => goTo(stepIndex + 1, 'forward'), 200);
	}

	function selectLookingFor(value: RiderPreferences['lookingFor']) {
		setAnswers((prev) => ({ ...prev, lookingFor: value }));
	}

	function handleSkip() {
		if (isLastStep) {
			finish(answers);
		} else {
			goTo(stepIndex + 1, 'forward');
		}
	}

	const zipIsValid = /^\d{5}$/.test(zipDraft.trim());

	return (
		<div className={styles.wizard}>
			<div className={styles.progress}>
				{STEPS.map((key, i) => (
					<div
						key={key}
						className={`${styles.progressSegment} ${i <= stepIndex ? styles.progressActive : ''}`}
					/>
				))}
			</div>

			<div
				key={step}
				className={`${styles.stepBody} ${direction === 'forward' ? styles.slideInRight : styles.slideInLeft}`}
			>
				{step === 'zipCode' && (
					<>
						<h2>Where are you riding out of?</h2>
						<p className={styles.stepHint}>
							We&rsquo;ll use this to surface groups near you.
						</p>
						<form
							className={styles.zipForm}
							onSubmit={(event) => {
								event.preventDefault();
								if (zipIsValid) submitZip();
							}}
						>
							<input
								type='text'
								inputMode='numeric'
								pattern='\d{5}'
								maxLength={5}
								placeholder='ZIP code'
								aria-label='ZIP code'
								className={styles.zipInput}
								value={zipDraft}
								onChange={(event) =>
									setZipDraft(event.target.value.replace(/[^0-9]/g, ''))
								}
							/>
							<button
								type='submit'
								className={styles.continueBtn}
								disabled={!zipIsValid}
							>
								Continue
							</button>
						</form>
					</>
				)}

				{step === 'discipline' && (
					<>
						<h2>What&rsquo;s your riding discipline?</h2>
						<p className={styles.stepHint}>Select all that apply.</p>
						<div className={styles.optionGrid}>
							{DISCIPLINE_OPTIONS.map((option) => (
								<button
									key={option}
									type='button'
									aria-pressed={answers.disciplines.includes(option)}
									className={`${styles.optionCard} ${answers.disciplines.includes(option) ? styles.optionSelected : ''}`}
									onClick={() => toggleDiscipline(option)}
								>
									{option}
								</button>
							))}
						</div>
						<button
							type='button'
							className={styles.continueBtn}
							disabled={answers.disciplines.length === 0}
							onClick={() => goTo(stepIndex + 1, 'forward')}
						>
							Continue
						</button>
					</>
				)}

				{step === 'skillLevel' && (
					<>
						<h2>What&rsquo;s your skill level?</h2>
						<p className={styles.stepHint}>
							Be honest &mdash; it&rsquo;ll help us match your pace.
						</p>
						<div className={styles.optionGrid}>
							{SKILL_LEVEL_OPTIONS.map((option) => (
								<button
									key={option}
									type='button'
									className={`${styles.optionCard} ${answers.skillLevel === option ? styles.optionSelected : ''}`}
									onClick={() => selectSkillLevel(option)}
								>
									{option}
								</button>
							))}
						</div>
					</>
				)}

				{step === 'lookingFor' && (
					<>
						<h2>What are you looking for?</h2>
						<p className={styles.stepHint}>
							A team, a club, a casual group ride &mdash; or all of it.
						</p>
						<div className={styles.optionGrid}>
							{LOOKING_FOR_OPTIONS.map((option) => (
								<button
									key={option}
									type='button'
									className={`${styles.optionCard} ${answers.lookingFor === option ? styles.optionSelected : ''}`}
									onClick={() => selectLookingFor(option)}
								>
									{option}
								</button>
							))}
							<button
								type='button'
								className={`${styles.optionCard} ${answers.lookingFor === null ? styles.optionSelected : ''}`}
								onClick={() => selectLookingFor(null)}
							>
								Any
							</button>
						</div>
						<button
							type='button'
							className={styles.finishBtn}
							disabled={isFinishing}
							onClick={() => finish(answers)}
						>
							{isFinishing ? 'Finding matches…' : 'Find my matches'}
						</button>
					</>
				)}
			</div>

			<div className={styles.nav}>
				<div className={styles.navLeft}>
					{stepIndex > 0 && (
						<button
							type='button'
							className={styles.backBtn}
							onClick={() => goTo(stepIndex - 1, 'back')}
						>
							Back
						</button>
					)}
				</div>
				<div className={styles.navRight}>
					<button type='button' className={styles.skipBtn} onClick={handleSkip}>
						{isLastStep ? 'Skip to search' : 'Skip this question'}
					</button>
				</div>
			</div>

			<footer className={styles.footer}>
				<p>
					Already know what you&rsquo;re looking for?{' '}
					<Link href='/search'>Browse all groups</Link>.
				</p>
			</footer>
		</div>
	);
}
