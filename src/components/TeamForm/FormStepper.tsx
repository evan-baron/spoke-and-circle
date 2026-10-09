import MountainProgress from '@/components/Graphics/MountainProgress';
import type { FormStep } from './formSteps';
import styles from './formStepper.module.scss';

interface FormStepperProps {
	steps: FormStep[];
	current: number;
	onSelect: (index: number) => void;
}

export function FormStepper({ steps, current, onSelect }: FormStepperProps) {
	return (
		<nav aria-label='Form progress' className={styles.trail}>
			<div className={styles.mountain}>
				<MountainProgress step={current} />
			</div>
			<ol className={styles.stops}>
				{steps.map((step, index) => {
					const state =
						index === current ? styles.stopCurrent
						: index < current ? styles.stopDone
						: '';

					return (
						<li key={step.id} className={`${styles.stop} ${state}`}>
							<button
								type='button'
								className={styles.stopButton}
								disabled={index > current}
								aria-label={`${step.label}${index < current ? ' (completed)' : ''}`}
								aria-current={index === current ? 'step' : undefined}
								onClick={() => onSelect(index)}
							>
								<span className={styles.stopLabel} aria-hidden='true'>
									{step.label}
								</span>
								<span className={styles.stopShort} aria-hidden='true'>
									{step.shortLabel}
								</span>
							</button>
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
