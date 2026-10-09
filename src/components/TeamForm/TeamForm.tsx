'use client';

import {
	type FormEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';
import { Checkbox } from './Checkbox';
import { DEFAULT_TEAM_FORM_VALUES } from '@/lib/teamFormDefaults';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { trackEvent } from '@/lib/analytics';
import { payloadToTeam } from '@/lib/previewTeam';
import { buildTeamPayload } from '@/lib/teamForm';
import type { Team, TeamFormValues, TeamMediaItem } from '@/lib/types';
import { describeSubmitError } from './describeSubmitError';
import { DetailsSection } from './DetailsSection';
import { FormStepper } from './FormStepper';
import { getFormSteps, validateStep } from './formSteps';
import { GenericInfoSection } from './GenericInfoSection';
import { HumanCheckSection } from './HumanCheckSection';
import { LeaveFormDialog } from './LeaveFormDialog';
import { ListingPreview } from './ListingPreview';
import { MediaSection } from './MediaSection';
import { RejectionSection } from './RejectionSection';
import { RideDetailsSection } from './RideDetailsSection';
import { Section } from './Section';
import { StepActions } from './StepActions';
import { SubmitActions } from './SubmitActions';
import { SubmitErrors } from './SubmitErrors';
import { TagsSection } from './TagsSection';
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
	lockedToParent?: boolean;
	cancelHref?: string;
	canUploadMedia?: boolean;
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
	lockedToParent = false,
	cancelHref,
	canUploadMedia = true,
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
	const [mediaUploading, setMediaUploading] = useState(false);
	const handleMediaUploadingChange = useCallback(
		(uploading: boolean) => setMediaUploading(uploading),
		[],
	);
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
	const isCreate = mode === 'create';
	const steps = getFormSteps(groupType);
	const lastStep = steps.length - 1;
	const [step, setStep] = useState(0);
	const [direction, setDirection] = useState<'forward' | 'back'>('forward');
	const [stepErrors, setStepErrors] = useState<string[]>([]);
	const formRef = useRef<HTMLFormElement>(null);
	const stepperRef = useRef<HTMLDivElement>(null);
	const counterRef = useRef<HTMLParagraphElement>(null);
	const stepErrorRef = useRef<HTMLDivElement>(null);
	const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
	const stepChangedRef = useRef(false);
	const mediaItemsRef = useRef<TeamMediaItem[]>([]);
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewTeam, setPreviewTeam] = useState<Team | null>(null);
	const [isDirty, setIsDirty] = useState(false);
	const guard = useUnsavedChangesGuard(isCreate && isDirty);
	const handleMediaChange = useCallback((items: TeamMediaItem[]) => {
		mediaItemsRef.current = items;
	}, []);

	useEffect(() => {
		if (submitErrors.length > 0) setPreviewOpen(false);
	}, [submitErrors]);

	const stepName = steps[step]?.label ?? '';

	useEffect(() => {
		if (!isCreate) return;
		trackEvent('form_step_view', {
			form: 'new_team',
			step: step + 1,
			step_name: stepName,
		});
	}, [isCreate, step, stepName]);

	useEffect(() => {
		if (!stepChangedRef.current) return;
		counterRef.current?.focus({ preventScroll: true });
		stepperRef.current?.scrollIntoView({ block: 'start' });
	}, [step]);

	function goToStep(index: number, nextDirection: 'forward' | 'back') {
		stepChangedRef.current = true;
		setDirection(nextDirection);
		setStepErrors([]);
		setStep(index);
	}

	function isCurrentStepValid() {
		const form = formRef.current;
		const panel = panelRefs.current[step];
		const current = steps[step];
		if (!form || !panel || !current) return false;

		const { errors, focused } = validateStep(current.id, form, panel);
		if (errors.length === 0) return true;

		trackEvent('form_next_blocked', {
			form: 'new_team',
			step: step + 1,
			step_name: current.label,
		});
		setStepErrors(errors);
		if (!focused) requestAnimationFrame(() => stepErrorRef.current?.focus());
		return false;
	}

	function openPreview() {
		const form = formRef.current;
		if (!form) return;

		trackEvent('form_preview_open', { form: 'new_team' });
		const payload = buildTeamPayload(form);
		const hasParentPrefix =
			payload.type === 'Group Ride' && Boolean(payload.affiliatedId);
		setPreviewTeam(
			payloadToTeam(payload, {
				media: mediaItemsRef.current,
				namePrefix: hasParentPrefix ? payload.affiliation : undefined,
			}),
		);
		setPreviewOpen(true);
	}

	function goNext() {
		if (isCurrentStepValid()) goToStep(step + 1, 'forward');
	}

	async function run(action: () => Promise<void>) {
		busyRef.current = true;
		setIsSubmitting(true);
		setSubmitErrors([]);

		try {
			await action();
			setIsDirty(false);
			if (isCreate) trackEvent('form_submit', { form: 'new_team' });
		} catch (error) {
			setSubmitErrors(describeSubmitError(error));
			busyRef.current = false;
			setIsSubmitting(false);
		}
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (isCreate && step < lastStep) {
			goNext();
			return;
		}
		if (isCreate && !isCurrentStepValid()) return;
		if ((isCreate && !isAntiBotValid) || busyRef.current) return;

		if (mediaUploading) {
			setSubmitErrors(['Wait for your photos to finish uploading']);
			return;
		}

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

	const genericSection = (
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
			lockedToParent={lockedToParent}
			namePrefix={
				isCreate && groupType === 'Group Ride' && affiliatedId ?
					affiliationLabel
				:	undefined
			}
		/>
	);

	const profileSection = (
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
	);

	const structureSection =
		groupType === 'Group Ride' ?
			<RideDetailsSection
				values={values}
				hasSegmentation={hasSegmentation}
				onSegmentationChange={handleSegmentationChange}
				segmentationDescription={segmentationDescription}
				onSegmentationDescriptionChange={setSegmentationDescription}
			/>
		:	<TeamClubDetailsSection values={values} />;

	const additionalSections = (
		<>
			<TagsSection values={values} />

			<MediaSection
				initialMedia={values.media}
				canUpload={canUploadMedia}
				submitting={isSubmitting}
				onUploadingChange={handleMediaUploadingChange}
				onMediaChange={handleMediaChange}
			/>
		</>
	);

	if (isCreate) {
		const panels = [
			genericSection,
			profileSection,
			structureSection,
			<>
				{additionalSections}
				<HumanCheckSection onValidChange={setIsAntiBotValid} />
			</>,
		];
		const slideClass =
			direction === 'forward' ? styles.panelForward : styles.panelBack;

		return (
			<form
				ref={formRef}
				noValidate
				onSubmit={handleSubmit}
				onChange={() => stepErrors.length > 0 && setStepErrors([])}
				onInput={() => setIsDirty(true)}
				className={styles.form}
			>
				<div ref={stepperRef} className={styles.stepper}>
					<FormStepper
						steps={steps}
						current={step}
						onSelect={(index) => goToStep(index, 'back')}
					/>

					<p ref={counterRef} tabIndex={-1} className={styles.stepCounter}>
						Step {step + 1} of {steps.length}
					</p>

					{panels.map((panel, index) => (
						<div
							key={steps[index]?.id}
							ref={(element) => {
								panelRefs.current[index] = element;
							}}
							hidden={index !== step}
							className={`${styles.stepPanel} ${index === step ? slideClass : ''}`}
						>
							{panel}
						</div>
					))}

					{stepErrors.length > 0 && (
						<div
							ref={stepErrorRef}
							tabIndex={-1}
							className={styles.submitError}
							role='alert'
						>
							<p>Finish this step before continuing:</p>
							<ul>
								{stepErrors.map((message) => (
									<li key={message}>{message}</li>
								))}
							</ul>
						</div>
					)}

					<SubmitErrors errors={submitErrors} isReview={false} />

					<StepActions
						step={step}
						isLastStep={step === lastStep}
						isSubmitting={isSubmitting}
						isAntiBotValid={isAntiBotValid}
						onPrev={() => goToStep(step - 1, 'back')}
						onNext={goNext}
						onPreview={openPreview}
					/>
				</div>

				<ListingPreview
					open={previewOpen}
					team={previewTeam}
					isSubmitting={isSubmitting}
					isAntiBotValid={isAntiBotValid}
					onClose={() => setPreviewOpen(false)}
				/>

				<LeaveFormDialog
					open={guard.prompting}
					onStay={guard.stay}
					onLeave={guard.leave}
				/>
			</form>
		);
	}

	return (
		<form onSubmit={handleSubmit} className={styles.form}>
			{genericSection}

			{profileSection}

			{structureSection}

			{additionalSections}

			{showAdminFields && (
				<Section title='Admin'>
					<Checkbox
						label='Verified'
						name='verified'
						defaultChecked={initialVerified}
					/>
				</Section>
			)}

			<SubmitErrors errors={submitErrors} isReview />

			{isReview && (
				<RejectionSection
					submitter={submitter}
					rejectionReason={rejectionReason}
					onRejectionReasonChange={setRejectionReason}
				/>
			)}

			<SubmitActions
				mode={isReview ? 'review' : 'edit'}
				cancelHref={cancelHref}
				isSubmitting={isSubmitting}
				confirmingReject={confirmingReject}
				onConfirmReject={() => setConfirmingReject(true)}
				onCancelReject={() => setConfirmingReject(false)}
				onReject={handleReject}
			/>
		</form>
	);
}
