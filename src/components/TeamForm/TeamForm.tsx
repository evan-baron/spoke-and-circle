'use client';

import { type FormEvent, useRef, useState } from 'react';
import { Checkbox } from './Checkbox';
import { DEFAULT_TEAM_FORM_VALUES } from '@/lib/teamFormDefaults';
import { buildTeamPayload } from '@/lib/teamForm';
import type { RideDay, TeamFormValues } from '@/lib/types';
import { describeSubmitError } from './describeSubmitError';
import { DetailsSection } from './DetailsSection';
import { GenericInfoSection } from './GenericInfoSection';
import { HumanCheckSection } from './HumanCheckSection';
import { RejectionSection } from './RejectionSection';
import { RideDetailsSection } from './RideDetailsSection';
import { Section } from './Section';
import { SubmitActions } from './SubmitActions';
import { SubmitErrors } from './SubmitErrors';
import { TeamClubDetailsSection } from './TeamClubDetailsSection';
import styles from './teamForm.module.scss';

export interface TeamFormProps {
	mode: 'create' | 'review' | 'edit';
	initialValues?: TeamFormValues;
	initialVerified?: boolean;
	onSubmit: (payload: ReturnType<typeof buildTeamPayload>) => Promise<void>;
	submitter?: { name: string; email: string } | null;
	onReject?: (reason: string | undefined) => Promise<void>;
	excludeTeamId?: string;
	showAdminFields?: boolean;
}

export function TeamForm({
	mode,
	initialValues,
	initialVerified,
	submitter,
	onSubmit,
	onReject,
	excludeTeamId,
	showAdminFields = true,
}: TeamFormProps) {
	const values = initialValues ?? DEFAULT_TEAM_FORM_VALUES;
	const isReview = mode === 'review';
	const isEdit = mode === 'edit';
	const [rejectionReason, setRejectionReason] = useState('');
	const [isAntiBotValid, setIsAntiBotValid] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitErrors, setSubmitErrors] = useState<string[]>([]);
	const [confirmingReject, setConfirmingReject] = useState(false);
	const busyRef = useRef(false);
	const [groupType, setGroupType] = useState(values.type);
	const [affiliationLabel, setAffiliationLabel] = useState(values.affiliation);
	const [affiliatedId, setAffiliatedId] = useState(values.affiliatedId);
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
	const [rideSchedule, setRideSchedule] = useState(values.rideSchedule);
	const [rideDays, setRideDays] = useState<RideDay[]>(values.rideDays);
	const [seasons, setSeasons] = useState<string[]>(values.seasons);

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
		if ((mode === 'create' && !isAntiBotValid) || busyRef.current) return;

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

	function handleRideScheduleChange(next: string) {
		setRideSchedule(next);
		if (next !== 'Weekly') setRideDays([]);
	}

	function handleToggleRideDay(day: string) {
		setRideDays((prev) =>
			prev.some((entry) => entry.day === day) ?
				prev.filter((entry) => entry.day !== day)
			:	[...prev, { day, details: '' }],
		);
	}

	function handleRideDayDetailsChange(day: string, details: string) {
		setRideDays((prev) =>
			prev.map((entry) => (entry.day === day ? { ...entry, details } : entry)),
		);
	}

	function handleSeasonChange(season: string) {
		setSeasons((prev) => {
			if (season === 'Year Round') {
				return prev.includes('Year Round') ? [] : ['Year Round'];
			}
			const withoutYearRound = prev.filter((entry) => entry !== 'Year Round');
			return withoutYearRound.includes(season) ?
					withoutYearRound.filter((entry) => entry !== season)
				:	[...withoutYearRound, season];
		});
	}

	return (
		<form onSubmit={handleSubmit} className={styles.form}>
			<GenericInfoSection
				values={values}
				groupType={groupType}
				onGroupTypeChange={setGroupType}
				affiliationLabel={affiliationLabel}
				affiliatedId={affiliatedId}
				onAffiliationChange={(label, id) => {
					setAffiliationLabel(label);
					setAffiliatedId(id);
				}}
				excludeTeamId={excludeTeamId}
			/>

			<DetailsSection
				values={values}
				groupType={groupType}
				virtualPlatforms={virtualPlatforms}
				onVirtualPlatformChange={handleVirtualPlatformChange}
				virtualPlatformOtherText={virtualPlatformOtherText}
				onVirtualPlatformOtherTextChange={setVirtualPlatformOtherText}
				personaRestriction={personaRestriction}
				onPersonaChange={handlePersonaChange}
				personaOtherText={personaOtherText}
				onPersonaOtherTextChange={setPersonaOtherText}
			/>

			{groupType === 'Group Ride' && (
				<RideDetailsSection
					values={values}
					rideSchedule={rideSchedule}
					onRideScheduleChange={handleRideScheduleChange}
					rideDays={rideDays}
					onToggleRideDay={handleToggleRideDay}
					onRideDayDetailsChange={handleRideDayDetailsChange}
					seasons={seasons}
					onSeasonChange={handleSeasonChange}
					hasSegmentation={hasSegmentation}
					onSegmentationChange={handleSegmentationChange}
					segmentationDescription={segmentationDescription}
					onSegmentationDescriptionChange={setSegmentationDescription}
				/>
			)}

			{groupType !== 'Group Ride' && <TeamClubDetailsSection values={values} />}

			{(isEdit || isReview) && showAdminFields && (
				<Section title='Admin'>
					<Checkbox
						label='Verified'
						name='verified'
						defaultChecked={initialVerified}
					/>
				</Section>
			)}

			{mode === 'create' && (
				<HumanCheckSection onValidChange={setIsAntiBotValid} />
			)}

			<SubmitErrors errors={submitErrors} isReview={mode !== 'create'} />

			{isReview && (
				<RejectionSection
					submitter={submitter}
					rejectionReason={rejectionReason}
					onRejectionReasonChange={setRejectionReason}
				/>
			)}

			<SubmitActions
				mode={mode}
				isSubmitting={isSubmitting}
				isAntiBotValid={isAntiBotValid}
				confirmingReject={confirmingReject}
				onConfirmReject={() => setConfirmingReject(true)}
				onCancelReject={() => setConfirmingReject(false)}
				onReject={handleReject}
			/>
		</form>
	);
}
