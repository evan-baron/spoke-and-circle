import { AntiBot } from '@/components/AntiBot/AntiBot';
import { Section } from './Section';

interface HumanCheckSectionProps {
	groupType: string;
	onValidChange: (valid: boolean) => void;
}

export function HumanCheckSection({
	groupType,
	onValidChange,
}: HumanCheckSectionProps) {
	const noun = groupType === 'Group Ride' ? 'group ride' : 'group';

	return (
		<Section
			title='Are you human?'
			description={`Answer this question in order to submit your ${noun}`}
		>
			<AntiBot onValidChange={onValidChange} />
		</Section>
	);
}
