import type { FormStep } from './formSteps';
import stepperStyles from './formStepper.module.scss';
import styles from './sectionNav.module.scss';

interface SectionNavProps {
	sections: FormStep[];
	activeId: string;
	onSelect: (id: string) => void;
}

export function SectionNav({ sections, activeId, onSelect }: SectionNavProps) {
	return (
		<div className={styles.sticky}>
			<nav aria-label='Form sections'>
				<ol className={stepperStyles.progress}>
					{sections.map((section) => {
						const isActive = section.id === activeId;

						return (
							<li
								key={section.id}
								className={`${stepperStyles.item} ${isActive ? `${stepperStyles.current} ${styles.active}` : ''}`}
							>
								<button
									type='button'
									className={`${stepperStyles.segment} ${styles.segment}`}
									aria-label={section.label}
									aria-current={isActive ? 'true' : undefined}
									onClick={() => onSelect(section.id)}
								>
									<span className={stepperStyles.bar} />
									<span className={stepperStyles.label} aria-hidden='true'>
										{section.label}
									</span>
									<span className={styles.shortLabel} aria-hidden='true'>
										{section.shortLabel}
									</span>
								</button>
							</li>
						);
					})}
				</ol>
			</nav>
		</div>
	);
}
