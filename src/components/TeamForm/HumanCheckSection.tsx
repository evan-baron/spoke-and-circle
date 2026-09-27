import { AntiBot } from '@/components/AntiBot/AntiBot';
import { Section } from './Section';

interface HumanCheckSectionProps {
	onValidChange: (valid: boolean) => void;
}

export function HumanCheckSection({ onValidChange }: HumanCheckSectionProps) {
	return (
		<Section
			title='Are you human?'
			description='Answer this quick question to enable submitting.'
		>
			<AntiBot onValidChange={onValidChange} />
		</Section>
	);
}
