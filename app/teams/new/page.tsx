'use client';

import Link from 'next/link';
import { type ChangeEvent, type FormEvent, useState } from 'react';
import styles from './newTeam.module.scss';

const CLUB_TYPES = ['Team', 'Club', 'Group', 'Organization'];
const BIKE_TYPES = ['Road', 'Gravel', 'MTB', 'Track', 'Tri', 'E-bike', 'Mixed'];
const FORMATS = ['In-person', 'Virtual', 'Hybrid'];
const VIRTUAL_PLATFORMS = ['Zwift', 'Strava', 'TrainerRoad', 'Other'];
const SCHEDULES = ['Weekly', 'Monthly', 'Annually'];
const PACES = ['Casual', 'Steady', 'Competitive'];
const DROP_POLICIES = ['Drop', 'No-drop'];
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const RANKING_SYSTEMS = ['Captains', 'Ride Leaders', 'Liaison', 'N/A'];
const PERSONA_OPTIONS = [
	{ value: 'allAllowed', label: 'All allowed' },
	{ value: 'womenOnly', label: 'Women only' },
	{ value: 'menOnly', label: 'Men only' },
	{ value: 'lgbtOnly', label: 'LGBT only' },
	{ value: 'other', label: 'Other' },
];

interface FieldProps {
	label: string;
	hint?: string;
	full?: boolean;
	children: React.ReactNode;
}

function Field({ label, hint, full, children }: FieldProps) {
	return (
		<label className={`${styles.field} ${full ? styles.fieldFull : ''}`}>
			<span className={styles.fieldLabel}>{label}</span>
			{children}
			{hint && <span className={styles.fieldHint}>{hint}</span>}
		</label>
	);
}

interface CheckboxProps {
	label: string;
	name: string;
	value?: string;
	checked?: boolean;
	onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

function Checkbox({ label, name, value, checked, onChange }: CheckboxProps) {
	return (
		<label className={styles.checkbox}>
			<input
				type='checkbox'
				name={name}
				value={value}
				checked={checked}
				onChange={onChange}
			/>
			<span>{label}</span>
		</label>
	);
}

interface SectionProps {
	title: string;
	description?: string;
	children: React.ReactNode;
}

function Section({ title, description, children }: SectionProps) {
	return (
		<fieldset className={styles.section}>
			<legend className={styles.sectionTitle}>{title}</legend>
			{description && (
				<p className={styles.sectionDescription}>{description}</p>
			)}
			<div className={styles.sectionGrid}>{children}</div>
		</fieldset>
	);
}

export default function NewTeamPage() {
	const [submitted, setSubmitted] = useState(false);
	const [personaRestriction, setPersonaRestriction] = useState<string | null>(
		null,
	);
	const [personaOtherText, setPersonaOtherText] = useState('');
	const [virtualPlatforms, setVirtualPlatforms] = useState<string[]>([]);
	const [virtualPlatformOtherText, setVirtualPlatformOtherText] = useState('');
	const [hasSegmentation, setHasSegmentation] = useState<'yes' | 'no' | null>(
		null,
	);
	const [segmentationDescription, setSegmentationDescription] = useState('');

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSubmitted(true);
	}

	function handlePersonaChange(value: string) {
		setPersonaRestriction((prev) => (prev === value ? null : value));
	}

	function handleVirtualPlatformChange(value: string) {
		setVirtualPlatforms((prev) =>
			prev.includes(value) ?
				prev.filter((platform) => platform !== value)
			:	[...prev, value],
		);
	}

	function handleSegmentationChange(value: 'yes' | 'no') {
		setHasSegmentation((prev) => (prev === value ? null : value));
	}

	if (submitted) {
		return (
			<main className={styles.page}>
				<div className={`${styles.wrap} ${styles.confirmation}`}>
					<div className={styles.confirmationCard}>
						<p className={styles.confirmationMark}>&#10003;</p>
						<h1>Submission received</h1>
						<p>
							In a live version of this app, an admin would review this
							submission before it appears in search results. This is a
							wireframe, so nothing was actually saved.
						</p>
						<div className={styles.confirmationActions}>
							<Link href='/search' className={styles.buttonOutline}>
								Back to search
							</Link>
							<button
								type='button'
								className={styles.buttonSolid}
								onClick={() => setSubmitted(false)}
							>
								Submit another
							</button>
						</div>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className={styles.page}>
			<div className={styles.wrap}>
				<Link href='/search' className={styles.backLink}>
					&larr; Back to search
				</Link>

				<header className={styles.header}>
					<p className={styles.eyebrow}>Submit a team</p>
					<h1>Submit a new team</h1>
					<p>
						Send a team, club, or group for an admin to review. They may follow
						up with you before it goes live.
					</p>
				</header>

				<form onSubmit={handleSubmit} className={styles.form}>
					<Section title='Generic info'>
						<Field label='Name'>
							<input
								type='text'
								name='name'
								required
								placeholder='e.g. Portland Velo Collective'
								className={styles.input}
							/>
						</Field>
						<Field label='Type'>
							<select name='type' defaultValue='Club' className={styles.input}>
								{CLUB_TYPES.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</Field>
						<Field label='Mission statement' full>
							<textarea
								name='missionStatement'
								rows={2}
								placeholder='What is this group trying to do?'
								className={styles.input}
							/>
						</Field>
						<Field label='Code of conduct' full>
							<textarea
								name='codeOfConduct'
								rows={2}
								placeholder='Any ground rules for members and rides'
								className={styles.input}
							/>
						</Field>
						<Field label='Affiliation'>
							<input
								type='text'
								name='affiliation'
								placeholder='e.g. USA Cycling Club Member'
								className={styles.input}
							/>
						</Field>
						<Field label='Location'>
							<input
								type='text'
								name='location'
								required
								placeholder='City, State'
								className={styles.input}
							/>
						</Field>
						<Field label='Additional locations' hint='Comma-separated'>
							<input
								type='text'
								name='additionalLocations'
								placeholder='e.g. Beaverton, OR'
								className={styles.input}
							/>
						</Field>
						<Field label='Founded'>
							<input
								type='number'
								name='founded'
								min={1970}
								max={2026}
								placeholder='2024'
								className={styles.input}
							/>
						</Field>
						<Field label='Public or private'>
							<select
								name='visibility'
								defaultValue='Public'
								className={styles.input}
							>
								<option value='Public'>Public</option>
								<option value='Private'>Private</option>
							</select>
						</Field>
						<Field label='Primary language'>
							<input
								type='text'
								name='primaryLanguage'
								placeholder='English'
								className={styles.input}
							/>
						</Field>
						<Field label='Contact phone'>
							<input
								type='tel'
								name='contactPhone'
								placeholder='555-555-0100'
								className={styles.input}
							/>
						</Field>
						<Field label='Contact email'>
							<input
								type='email'
								name='contactEmail'
								placeholder='hello@yourteam.org'
								className={styles.input}
							/>
						</Field>
					</Section>

					<Section title='Details'>
						<Field label='Bike type'>
							<select
								name='bikeType'
								defaultValue='Road'
								className={styles.input}
							>
								{BIKE_TYPES.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</Field>
						<Field label='Virtual or in-person'>
							<select
								name='format'
								defaultValue='In-person'
								className={styles.input}
							>
								{FORMATS.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</Field>
						<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
							<span className={styles.fieldLabel}>Virtual platform(s)</span>
							<div className={styles.checkboxRow}>
								{VIRTUAL_PLATFORMS.map((platform) => (
									<Checkbox
										key={platform}
										label={platform}
										name='virtualPlatform'
										value={platform}
										checked={virtualPlatforms.includes(platform)}
										onChange={() => handleVirtualPlatformChange(platform)}
									/>
								))}
							</div>
							{virtualPlatforms.includes('Other') && (
								<input
									type='text'
									name='virtualPlatformOtherDescription'
									placeholder='Please describe'
									value={virtualPlatformOtherText}
									onChange={(event) =>
										setVirtualPlatformOtherText(event.target.value)
									}
									className={styles.input}
								/>
							)}
						</div>
						<Field label='Home-base affiliation'>
							<input
								type='text'
								name='homeBaseAffiliation'
								placeholder='e.g. Zwift Racing League'
								className={styles.input}
							/>
						</Field>
						<Field label='Website'>
							<input
								type='url'
								name='website'
								placeholder='https://'
								className={styles.input}
							/>
						</Field>
						<Field label='Instagram'>
							<input
								type='text'
								name='instagram'
								placeholder='@yourteam'
								className={styles.input}
							/>
						</Field>
						<Field label='Facebook'>
							<input
								type='text'
								name='facebook'
								placeholder='Page name'
								className={styles.input}
							/>
						</Field>
						<Field label='Strava'>
							<input
								type='text'
								name='strava'
								placeholder='Club name'
								className={styles.input}
							/>
						</Field>
						<Field label='Discord'>
							<input
								type='text'
								name='discord'
								placeholder='discord.gg/&hellip;'
								className={styles.input}
							/>
						</Field>
						<Field label='Minimum age'>
							<input
								type='number'
								name='ageMin'
								min={0}
								max={120}
								className={styles.input}
							/>
						</Field>
						<Field label='Maximum age'>
							<input
								type='number'
								name='ageMax'
								min={0}
								max={120}
								className={styles.input}
							/>
						</Field>
						<Field label='Current member count'>
							<input
								type='number'
								name='memberCount'
								min={0}
								className={styles.input}
							/>
						</Field>
						<Field label='Maximum member limit'>
							<input
								type='number'
								name='memberLimit'
								min={0}
								className={styles.input}
							/>
						</Field>
						<Field label='How to join' full>
							<textarea
								name='howToJoin'
								rows={2}
								placeholder='What should a prospective member do?'
								className={styles.input}
							/>
						</Field>

						<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
							<span className={styles.fieldLabel}>Persona restrictions</span>
							<div className={styles.checkboxRow}>
								{PERSONA_OPTIONS.map((option) => (
									<Checkbox
										key={option.value}
										label={option.label}
										name='personaRestriction'
										value={option.value}
										checked={personaRestriction === option.value}
										onChange={() => handlePersonaChange(option.value)}
									/>
								))}
							</div>
							{personaRestriction === 'other' && (
								<input
									type='text'
									name='personaOtherDescription'
									placeholder='Please describe'
									value={personaOtherText}
									onChange={(event) => setPersonaOtherText(event.target.value)}
									className={styles.input}
								/>
							)}
						</div>
						<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
							<span className={styles.fieldLabel}>Other restrictions</span>

							<div className={styles.checkboxRow}>
								<Checkbox label='E-bike allowed' name='eBikeAllowed' />
								<Checkbox label='Waitlist active' name='waitlist' />
							</div>
						</div>
					</Section>
					{/* 
					<Section title='Ride details'>
						<Field label='Schedule'>
							<select
								name='rideSchedule'
								defaultValue='Weekly'
								className={styles.input}
							>
								{SCHEDULES.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</Field>
						<Field label='Start times' hint='Comma-separated'>
							<input
								type='text'
								name='startTimes'
								placeholder='e.g. Tue 6:00 PM, Sat 8:00 AM'
								className={styles.input}
							/>
						</Field>
						<Field label='Pace'>
							<select
								name='pace'
								defaultValue='Steady'
								className={styles.input}
							>
								{PACES.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</Field>
						<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
							<span className={styles.fieldLabel}>
								Skill/Speed Segmentation
							</span>
							<div className={styles.checkboxRow}>
								<Checkbox
									label='Yes'
									name='hasSegmentation'
									value='yes'
									checked={hasSegmentation === 'yes'}
									onChange={() => handleSegmentationChange('yes')}
								/>
								<Checkbox
									label='No'
									name='hasSegmentation'
									value='no'
									checked={hasSegmentation === 'no'}
									onChange={() => handleSegmentationChange('no')}
								/>
							</div>
							{hasSegmentation === 'yes' && (
								<input
									type='text'
									name='segmentationDescription'
									placeholder='A Group, B Group, etc.'
									value={segmentationDescription}
									onChange={(event) =>
										setSegmentationDescription(event.target.value)
									}
									className={styles.input}
								/>
							)}
						</div>
						<Field label='Typical distance' hint='Miles'>
							<input
								type='number'
								name='typicalDistanceMiles'
								min={0}
								className={styles.input}
							/>
						</Field>
						<Field label='Typical elevation gain' hint='Feet'>
							<input
								type='number'
								name='typicalElevationGainFt'
								min={0}
								className={styles.input}
							/>
						</Field>
						<Field label='Drop or no-drop'>
							<select
								name='dropPolicy'
								defaultValue='No-drop'
								className={styles.input}
							>
								{DROP_POLICIES.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</Field>
						<Field label='Ride visibility'>
							<select
								name='rideVisibility'
								defaultValue='Public'
								className={styles.input}
							>
								<option value='Public'>Public</option>
								<option value='Private'>Private</option>
							</select>
						</Field>
					</Section> */}

					<Section title='Team / club details'>
						<Field label='Competitive or casual'>
							<select
								name='competitiveOrCasual'
								defaultValue='Casual'
								className={styles.input}
							>
								<option value='Casual'>Casual</option>
								<option value='Competitive'>Competitive</option>
							</select>
						</Field>
						<Field label='Skill level'>
							<select
								name='skillLevel'
								defaultValue='Intermediate'
								className={styles.input}
							>
								{SKILL_LEVELS.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</Field>
						<Field label='Dues amount' hint='Leave blank if none'>
							<input
								type='text'
								name='duesAmount'
								placeholder='e.g. $150/year'
								className={styles.input}
							/>
						</Field>
						<Field label='Dues schedule'>
							<select
								name='duesSchedule'
								defaultValue='Annually'
								className={styles.input}
							>
								{SCHEDULES.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</Field>
						<Field label='Required races' hint='Minimum per season'>
							<input
								type='number'
								name='requiredRaces'
								min={0}
								className={styles.input}
							/>
						</Field>
						<Field label='Mileage requirement' hint='Minimum miles'>
							<input
								type='number'
								name='mileageMin'
								min={0}
								className={styles.input}
							/>
						</Field>
						<Field label='Mileage frequency'>
							<select
								name='mileageFrequency'
								defaultValue='Monthly'
								className={styles.input}
							>
								{SCHEDULES.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</Field>
						<Field label='Rankings'>
							<select
								name='rankingSystem'
								defaultValue='N/A'
								className={styles.input}
							>
								{RANKING_SYSTEMS.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</Field>
						<Field label='Sponsors' hint='Comma-separated' full>
							<input
								type='text'
								name='sponsors'
								placeholder='e.g. Lone Star Bikes, Velocity Nutrition'
								className={styles.input}
							/>
						</Field>

						<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
							<span className={styles.fieldLabel}>Team attributes</span>
							<div className={styles.checkboxRow}>
								<Checkbox label='Instructional' name='instructional' />
								<Checkbox label='Dues required' name='duesRequired' />
								<Checkbox label='Required rides' name='requiredRides' />
								<Checkbox label='Required kit / uniform' name='requiredKit' />
								<Checkbox label='Public roster' name='hasRoster' />
							</div>
						</div>

						<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
							<span className={styles.fieldLabel}>Event types</span>
							<div className={styles.checkboxRow}>
								<Checkbox label='Sponsor events' name='eventSponsor' />
								<Checkbox
									label='Team-specific events'
									name='eventTeamSpecific'
								/>
								<Checkbox label='Public events' name='eventPublic' />
								<Checkbox label='Recruiting events' name='eventRecruiting' />
							</div>
						</div>

						<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
							<span className={styles.fieldLabel}>
								Join / applicant requirements
							</span>
							<div className={styles.checkboxRow}>
								<Checkbox label='Try-outs required' name='joinTryouts' />
								<Checkbox label='Referral required' name='joinReferral' />
								<Checkbox label='Invite only' name='joinInviteOnly' />
								<Checkbox label='Open to all' name='joinOpen' />
							</div>
						</div>
					</Section>

					<div className={styles.submitRow}>
						<p>
							This is a wireframe &mdash; submitting won&rsquo;t save any data.
						</p>
						<button type='submit' className={styles.buttonSolid}>
							Submit for review
						</button>
					</div>
				</form>
			</div>
		</main>
	);
}
