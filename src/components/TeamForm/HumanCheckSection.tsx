import { AntiBot } from '@/components/AntiBot/AntiBot';
import { Section } from './Section';

interface HumanCheckSectionProps {
	onValidChange: (valid: boolean) => void;
}

export function HumanCheckSection({ onValidChange }: HumanCheckSectionProps) {
	return (
		<Section
			title='Are you human?'
			description='Answer this question in order to submit your group.'
		>
			<AntiBot onValidChange={onValidChange} />
		</Section>
	);
}
