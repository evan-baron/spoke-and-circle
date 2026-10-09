import { ArrowIcon } from '@/components/ArrowIcon/ArrowIcon';
import styles from './teamForm.module.scss';

interface StepActionsProps {
	step: number;
	isLastStep: boolean;
	isSubmitting: boolean;
	isAntiBotValid: boolean;
	onPrev: () => void;
	onNext: () => void;
	onPreview: () => void;
}

export function StepActions({
	step,
	isLastStep,
	isSubmitting,
	isAntiBotValid,
	onPrev,
	onNext,
	onPreview,
}: StepActionsProps) {
	return (
		<>
			{isLastStep && (
				<button
					type='button'
					className={styles.previewLink}
					disabled={isSubmitting}
					onClick={onPreview}
				>
					Preview your listing
				</button>
			)}
			<div className={styles.stepNav}>
				{step > 0 && (
					<button
						key='previous'
						type='button'
						className={styles.buttonOutline}
						disabled={isSubmitting}
						onClick={onPrev}
					>
						<ArrowIcon direction='left' />
						Previous
					</button>
				)}
				{isLastStep ?
					<button
						key='submit'
						type='submit'
						className={styles.buttonSolid}
						disabled={!isAntiBotValid || isSubmitting}
					>
						{isSubmitting ? 'Submitting…' : 'Submit for review'}
					</button>
				:	<button
						key='next'
						type='button'
						className={styles.buttonSolid}
						onClick={onNext}
					>
						Next
						<ArrowIcon direction='right' />
					</button>
				}
			</div>
		</>
	);
}
