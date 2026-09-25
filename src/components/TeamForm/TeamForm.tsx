'use client';

import {
	type ChangeEvent,
	type FormEvent,
	useId,
	useRef,
	useState,
} from 'react';
import { AntiBot } from '@/components/AntiBot/AntiBot';
import { LocationInput } from '@/components/LocationInput/LocationInput';
import { LocationListInput } from '@/components/LocationInput/LocationListInput';
import { DEFAULT_TEAM_FORM_VALUES } from '@/lib/teamFormDefaults';
import { buildTeamPayload } from '@/lib/teamForm';
import type { TeamFormValues } from '@/lib/types';
import { ApiError } from '@/services/apiError';
import styles from './teamForm.module.scss';

const CLUB_TYPES = [
	'Team',
	'Club',
	'Group Ride',
	'Youth Program',
	'Organization',
];
const BIKE_TYPES = [
	'Road',
	'Gravel',
	'MTB',
	'Track',
	'BMX',
	'Tri',
	'E-bike',
	'Mixed',
];
const FORMATS = ['In-person', 'Virtual', 'Hybrid'];
const VIRTUAL_PLATFORMS = ['Zwift', 'Strava', 'TrainerRoad', 'Other'];
const SCHEDULES = ['Weekly', 'Monthly', 'Annually'];
const PACES = ['Casual', 'Steady', 'Competitive'];
const DROP_POLICIES = ['Drop', 'No-drop'];
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
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
	defaultChecked?: boolean;
	onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

function Checkbox({
	label,
	name,
	value,
	checked,
	defaultChecked,
	onChange,
}: CheckboxProps) {
	return (
		<label className={styles.checkbox}>
			<input
				type='checkbox'
				name={name}
				value={value}
				checked={checked}
				defaultChecked={defaultChecked}
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
	// A <legend> can't reliably carry this custom a heading treatment across
	// browsers, so the visible title is a real <h2> — same element
	// DetailSection uses on the team page — and the <fieldset> gets its
	// accessible name from aria-labelledby instead of relying on <legend>.
	const titleId = useId();

	return (
		<fieldset className={styles.section} aria-labelledby={titleId}>
			<h2 id={titleId} className={styles.sectionTitle}>
				{title}
			</h2>
			{description && (
				<p className={styles.sectionDescription}>{description}</p>
			)}
			<div className={styles.sectionGrid}>{children}</div>
		</fieldset>
	);
}

function describeSubmitError(error: unknown): string[] {
	if (error instanceof ApiError) {
		if (error.status === 429) {
			return ['Too many requests. Please try again later.'];
		}

		const details = (error.responseData as { details?: unknown } | null)
			?.details;
		if (Array.isArray(details)) {
			const messages = details.filter(
				(detail): detail is string => typeof detail === 'string',
			);
			if (messages.length > 0) return messages;
		}

		return [error.message];
	}

	return ['Something went wrong. Please try again.'];
}

export interface TeamFormProps {
	mode: 'create' | 'review';
	initialValues?: TeamFormValues;
	onSubmit: (payload: ReturnType<typeof buildTeamPayload>) => Promise<void>;
	submitter?: { name: string; email: string } | null;
	onReject?: (reason: string | undefined) => Promise<void>;
}

export function TeamForm({
	mode,
	initialValues,
	submitter,
	onSubmit,
	onReject,
}: TeamFormProps) {
	const values = initialValues ?? DEFAULT_TEAM_FORM_VALUES;
	const isReview = mode === 'review';
	const locationId = useId();
	const additionalLocationsId = useId();
	const [rejectionReason, setRejectionReason] = useState('');
	const [isAntiBotValid, setIsAntiBotValid] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitErrors, setSubmitErrors] = useState<string[]>([]);
	const [confirmingReject, setConfirmingReject] = useState(false);
	const busyRef = useRef(false);
	const [groupType, setGroupType] = useState(values.type);
	const [personaRestriction, setPersonaRestriction] = useState<string | null>(
		values.personaRestriction,
	);
	const [personaOtherText, setPersonaOtherText] = useState(
		values.personaOtherDescription,
	);
	const [virtualPlatforms, setVirtualPlatforms] = useState<string[]>(
		values.virtualPlatform,
	);
	const [virtualPlatformOtherText, setVirtualPlatformOtherText] = useState('');
	const [hasSegmentation, setHasSegmentation] = useState<'yes' | 'no' | null>(
		null,
	);
	const [segmentationDescription, setSegmentationDescription] = useState('');

	async function run(action: () => Promise<void>) {
		busyRef.current = true;
		setIsSubmitting(true);
		setSubmitErrors([]);

		try {
			await action();
		} catch (error) {
			setSubmitErrors(describeSubmitError(error));
			busyRef.current = false;
			setIsSubmitting(false);
		}
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if ((!isReview && !isAntiBotValid) || busyRef.current) return;

		const payload = buildTeamPayload(event.currentTarget);
		await run(() => onSubmit(payload));
	}

	async function handleReject() {
		if (!onReject || busyRef.current) return;
		setConfirmingReject(false);
		await run(() => onReject(rejectionReason.trim() || undefined));
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

	return (
		<form onSubmit={handleSubmit} className={styles.form}>
			<Section title='Generic info'>
				<Field label='Group Name'>
					<input
						type='text'
						name='name'
						defaultValue={values.name}
						required
						placeholder='e.g. Portland Velo Collective'
						className={styles.input}
					/>
				</Field>
				<Field label='Group Type'>
					<select
						name='type'
						value={groupType}
						onChange={(event) => setGroupType(event.target.value)}
						className={styles.input}
					>
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
						defaultValue={values.missionStatement}
						rows={2}
						placeholder='What is this group trying to do?'
						className={styles.input}
					/>
				</Field>
				<Field label='Code of conduct' full>
					<textarea
						name='codeOfConduct'
						defaultValue={values.codeOfConduct}
						rows={2}
						placeholder='Any ground rules for members and rides'
						className={styles.input}
					/>
				</Field>
				<Field label='Affiliation'>
					<input
						type='text'
						name='affiliation'
						defaultValue={values.affiliation}
						placeholder='e.g. Bike Shop, Organization, etc.'
						className={styles.input}
					/>
				</Field>
				<div className={styles.field}>
					<label htmlFor={locationId} className={styles.fieldLabel}>
						Location
					</label>
					<LocationInput
						id={locationId}
						name='location'
						defaultValue={values.location}
						required
						placeholder='Start typing a US city or state'
					/>
				</div>
				<div className={styles.field}>
					<label htmlFor={additionalLocationsId} className={styles.fieldLabel}>
						Additional locations
					</label>
					<LocationListInput
						id={additionalLocationsId}
						name='additionalLocations'
						defaultValues={values.additionalLocations}
						placeholder='Search and add another US city or state'
					/>
					<span className={styles.fieldHint}>
						If your team has additional chapters, add each location they can be
						found, up to 10
					</span>
				</div>
				<Field label='Founded'>
					<input
						type='number'
						name='founded'
						defaultValue={values.founded}
						min={1970}
						max={2026}
						placeholder='2024'
						className={styles.input}
					/>
				</Field>
				<Field label='Public or private'>
					<select
						name='visibility'
						defaultValue={values.visibility}
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
						defaultValue={values.primaryLanguage}
						placeholder='English'
						className={styles.input}
					/>
				</Field>
				<Field label='Contact phone'>
					<input
						type='tel'
						name='contactPhone'
						defaultValue={values.contactPhone}
						placeholder='555-555-0100'
						className={styles.input}
					/>
				</Field>
				<Field label='Contact email'>
					<input
						type='email'
						name='contactEmail'
						defaultValue={values.contactEmail}
						placeholder='hello@yourteam.org'
						className={styles.input}
					/>
				</Field>
			</Section>

			<Section title='Details'>
				<Field label='Cycling Discipline'>
					<select
						name='bikeType'
						defaultValue={values.bikeType}
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
						defaultValue={values.format}
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
				<Field
					label='Home Base'
					hint='The shop, venue, league, or organization your group is based out of or belongs to. Ex: The Broken Spoke Bike Shop'
				>
					<input
						type='text'
						name='homeBase'
						defaultValue={values.homeBase}
						placeholder='e.g. Zwift Racing League'
						className={styles.input}
					/>
				</Field>
				<Field label='Website'>
					<input
						type='url'
						name='website'
						defaultValue={values.website}
						placeholder='https://'
						className={styles.input}
					/>
				</Field>
				<Field label='Instagram'>
					<input
						type='text'
						name='instagram'
						defaultValue={values.instagram}
						placeholder='@yourteam'
						className={styles.input}
					/>
				</Field>
				<Field label='Facebook'>
					<input
						type='text'
						name='facebook'
						defaultValue={values.facebook}
						placeholder='Page name'
						className={styles.input}
					/>
				</Field>
				<Field label='Strava'>
					<input
						type='text'
						name='strava'
						defaultValue={values.strava}
						placeholder='Club name'
						className={styles.input}
					/>
				</Field>
				<Field label='Discord'>
					<input
						type='text'
						name='discord'
						defaultValue={values.discord}
						placeholder='discord.gg/&hellip;'
						className={styles.input}
					/>
				</Field>
				<Field label='Minimum age'>
					<input
						type='number'
						name='ageMin'
						defaultValue={values.ageMin}
						min={0}
						max={120}
						className={styles.input}
					/>
				</Field>
				<Field label='Maximum age'>
					<input
						type='number'
						name='ageMax'
						defaultValue={values.ageMax}
						min={0}
						max={120}
						className={styles.input}
					/>
				</Field>
				<Field label='Current member count'>
					<input
						type='number'
						name='memberCount'
						defaultValue={values.memberCount}
						min={0}
						className={styles.input}
					/>
				</Field>
				<Field label='Maximum member limit'>
					<input
						type='number'
						name='memberLimit'
						defaultValue={values.memberLimit}
						min={0}
						className={styles.input}
					/>
				</Field>
				<Field label='How to join' full>
					<textarea
						name='howToJoin'
						defaultValue={values.howToJoin}
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
						<Checkbox
							label='E-bike allowed'
							name='eBikeAllowed'
							defaultChecked={values.eBikeAllowed}
						/>
						<Checkbox
							label='Waitlist active'
							name='waitlist'
							defaultChecked={values.waitlist}
						/>
					</div>
				</div>
			</Section>
			{groupType === 'Group Ride' && (
				<Section title='Ride details'>
					<Field label='Schedule'>
						<select
							name='rideSchedule'
							defaultValue={values.rideSchedule}
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
							defaultValue={values.startTimes}
							placeholder='e.g. Tue 6:00 PM, Sat 8:00 AM'
							className={styles.input}
						/>
					</Field>
					<Field label='Pace'>
						<select
							name='pace'
							defaultValue={values.pace}
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
						<span className={styles.fieldLabel}>Skill/Speed Segmentation</span>
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
							defaultValue={values.typicalDistanceMiles}
							min={0}
							className={styles.input}
						/>
					</Field>
					<Field label='Typical elevation gain' hint='Feet'>
						<input
							type='number'
							name='typicalElevationGainFt'
							defaultValue={values.typicalElevationGainFt}
							min={0}
							className={styles.input}
						/>
					</Field>
					<Field label='Drop or no-drop'>
						<select
							name='dropPolicy'
							defaultValue={values.dropPolicy}
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
							defaultValue={values.rideVisibility}
							className={styles.input}
						>
							<option value='Public'>Public</option>
							<option value='Private'>Private</option>
						</select>
					</Field>
				</Section>
			)}

			<Section title='Team / club details'>
				<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
					<span className={styles.fieldLabel}>Skill levels welcome</span>
					<div className={styles.checkboxRow}>
						{SKILL_LEVELS.map((option) => (
							<Checkbox
								key={option}
								label={option}
								name='skillLevel'
								value={option}
								defaultChecked={values.skillLevels.includes(option)}
							/>
						))}
					</div>
				</div>
				<Field label='Competitive or casual'>
					<select
						name='competitiveOrCasual'
						defaultValue={values.competitiveOrCasual}
						className={styles.input}
					>
						<option value='Casual'>Casual</option>
						<option value='Competitive'>Competitive</option>
					</select>
				</Field>
				<Field label='Dues amount' hint='Leave blank if none'>
					<input
						type='text'
						name='duesAmount'
						defaultValue={values.duesAmount}
						placeholder='e.g. $150/year'
						className={styles.input}
					/>
				</Field>
				<Field label='Dues schedule'>
					<select
						name='duesSchedule'
						defaultValue={values.duesSchedule}
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
						defaultValue={values.requiredRaces}
						min={0}
						className={styles.input}
					/>
				</Field>
				<Field label='Mileage requirement' hint='Minimum miles'>
					<input
						type='number'
						name='mileageMin'
						defaultValue={values.mileageMin}
						min={0}
						className={styles.input}
					/>
				</Field>
				<Field label='Mileage frequency'>
					<select
						name='mileageFrequency'
						defaultValue={values.mileageFrequency}
						className={styles.input}
					>
						{SCHEDULES.map((option) => (
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
						defaultValue={values.sponsors}
						placeholder='e.g. Lone Star Bikes, Velocity Nutrition'
						className={styles.input}
					/>
				</Field>

				<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
					<span className={styles.fieldLabel}>Team attributes</span>
					<div className={styles.checkboxRow}>
						<Checkbox
							label='Instructional'
							name='instructional'
							defaultChecked={values.instructional}
						/>
						<Checkbox
							label='Dues required'
							name='duesRequired'
							defaultChecked={values.duesRequired}
						/>
						<Checkbox
							label='Required rides'
							name='requiredRides'
							defaultChecked={values.requiredRides}
						/>
						<Checkbox
							label='Required kit / uniform'
							name='requiredKit'
							defaultChecked={values.requiredKit}
						/>
						<Checkbox
							label='Public roster'
							name='hasRoster'
							defaultChecked={values.hasRoster}
						/>
					</div>
				</div>

				<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
					<span className={styles.fieldLabel}>Event types</span>
					<div className={styles.checkboxRow}>
						<Checkbox
							label='Sponsor events'
							name='eventSponsor'
							defaultChecked={values.eventSponsor}
						/>
						<Checkbox
							label='Team-specific events'
							name='eventTeamSpecific'
							defaultChecked={values.eventTeamSpecific}
						/>
						<Checkbox
							label='Public events'
							name='eventPublic'
							defaultChecked={values.eventPublic}
						/>
						<Checkbox
							label='Recruiting events'
							name='eventRecruiting'
							defaultChecked={values.eventRecruiting}
						/>
					</div>
				</div>

				<div className={`${styles.checkboxGroup} ${styles.fieldFull}`}>
					<span className={styles.fieldLabel}>
						Join / applicant requirements
					</span>
					<div className={styles.checkboxRow}>
						<Checkbox
							label='Try-outs required'
							name='joinTryouts'
							defaultChecked={values.joinTryouts}
						/>
						<Checkbox
							label='Referral required'
							name='joinReferral'
							defaultChecked={values.joinReferral}
						/>
						<Checkbox
							label='Invite only'
							name='joinInviteOnly'
							defaultChecked={values.joinInviteOnly}
						/>
						<Checkbox
							label='Open to all'
							name='joinOpen'
							defaultChecked={values.joinOpen}
						/>
					</div>
				</div>
			</Section>

			{!isReview && (
				<Section
					title='Are you human?'
					description='Answer this quick question to enable submitting.'
				>
					<AntiBot onValidChange={setIsAntiBotValid} />
				</Section>
			)}

			{submitErrors.length > 0 && (
				<div className={styles.submitError} role='alert'>
					<p>
						We couldn&rsquo;t {isReview ? 'save this team' : 'submit your team'}
						:
					</p>
					<ul>
						{submitErrors.map((message) => (
							<li key={message}>{message}</li>
						))}
					</ul>
				</div>
			)}

			{isReview && (
				<div className={styles.rejectReason}>
					{submitter ?
						<Section title='Submission Rejection'>
							<Field
								label='Rejection reason'
								hint={`If you reject this team, ${submitter.name} (${submitter.email}) will be emailed this reason. The reason is optional.`}
								full
							>
								<textarea
									rows={3}
									maxLength={1000}
									value={rejectionReason}
									onChange={(event) => setRejectionReason(event.target.value)}
									placeholder='Tell the submitter why this was rejected'
									className={styles.input}
								/>
							</Field>
						</Section>
					:	<span className={styles.fieldHint}>
							This team was submitted anonymously, so there is no one to email
							if you reject it.
						</span>
					}
				</div>
			)}

			<div
				className={`${styles.submitRow} ${isReview ? styles.submitRowReview : ''}`}
			>
				{isReview ?
					<>
						<button
							type='submit'
							className={styles.buttonSolid}
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Working…' : 'Approve'}
						</button>
						{confirmingReject ?
							<>
								<button
									type='button'
									className={styles.buttonDanger}
									disabled={isSubmitting}
									onClick={handleReject}
								>
									Yes, reject and delete
								</button>
								<button
									type='button'
									className={styles.buttonOutline}
									disabled={isSubmitting}
									onClick={() => setConfirmingReject(false)}
								>
									Cancel
								</button>
							</>
						:	<button
								type='button'
								className={styles.buttonDanger}
								disabled={isSubmitting}
								onClick={() => setConfirmingReject(true)}
							>
								Reject
							</button>
						}
					</>
				:	<button
						type='submit'
						className={styles.buttonSolid}
						disabled={!isAntiBotValid || isSubmitting}
					>
						{isSubmitting ? 'Submitting…' : 'Submit for review'}
					</button>
				}
			</div>
		</form>
	);
}
