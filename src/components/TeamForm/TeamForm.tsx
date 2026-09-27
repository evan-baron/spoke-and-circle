'use client';

import { type FormEvent, useRef, useState } from 'react';
import { DEFAULT_TEAM_FORM_VALUES } from '@/lib/teamFormDefaults';
import { buildTeamPayload } from '@/lib/teamForm';
import type { RideDay, TeamFormValues } from '@/lib/types';
import { describeSubmitError } from './describeSubmitError';
import { DetailsSection } from './DetailsSection';
import { GenericInfoSection } from './GenericInfoSection';
import { HumanCheckSection } from './HumanCheckSection';
import { RejectionSection } from './RejectionSection';
import { RideDetailsSection } from './RideDetailsSection';
import { SubmitActions } from './SubmitActions';
import { SubmitErrors } from './SubmitErrors';
import { TeamClubDetailsSection } from './TeamClubDetailsSection';
import styles from './teamForm.module.scss';

export interface TeamFormProps {
	mode: 'create' | 'review';
	initialValues?: TeamFormValues;
	onSubmit: (payload: ReturnType<typeof buildTeamPayload>) => Promise<void>;
	submitter?: { name: string; email: string } | null;
	onReject?: (reason: string | undefined) => Promise<void>;
	excludeTeamId?: string;
}

export function TeamForm({
	mode,
	initialValues,
	submitter,
	onSubmit,
	onReject,
	excludeTeamId,
}: TeamFormProps) {
	const values = initialValues ?? DEFAULT_TEAM_FORM_VALUES;
	const isReview = mode === 'review';
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
					hasSegmentation={hasSegmentation}
					onSegmentationChange={handleSegmentationChange}
					segmentationDescription={segmentationDescription}
					onSegmentationDescriptionChange={setSegmentationDescription}
				/>
			)}

			{groupType !== 'Group Ride' && <TeamClubDetailsSection values={values} />}

			{!isReview && <HumanCheckSection onValidChange={setIsAntiBotValid} />}

			<SubmitErrors errors={submitErrors} isReview={isReview} />

			{isReview && (
				<RejectionSection
					submitter={submitter}
					rejectionReason={rejectionReason}
					onRejectionReasonChange={setRejectionReason}
				/>
			)}

			<SubmitActions
				isReview={isReview}
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
