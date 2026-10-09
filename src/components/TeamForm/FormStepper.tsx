import type { FormStep } from './formSteps';
import styles from './formStepper.module.scss';

interface FormStepperProps {
	steps: FormStep[];
	current: number;
	onSelect: (index: number) => void;
}

export function FormStepper({ steps, current, onSelect }: FormStepperProps) {
	return (
		<nav aria-label='Form progress'>
			<ol className={styles.progress}>
				{steps.map((step, index) => {
					const state =
						index < current ? styles.done
						: index === current ? styles.current
						: '';

					return (
						<li key={step.id} className={`${styles.item} ${state}`}>
							<button
								type='button'
								className={styles.segment}
								disabled={index > current}
								aria-current={index === current ? 'step' : undefined}
								onClick={() => onSelect(index)}
							>
								<span className={styles.bar} />
								<span className={styles.label}>{step.label}</span>
								<span className={styles.srOnly}>
									{index < current ? ' (completed)' : ''}
								</span>
							</button>
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
