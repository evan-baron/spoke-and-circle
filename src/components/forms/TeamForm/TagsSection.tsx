import { useId } from 'react';
import type { TeamFormValues } from '@/lib/types';
import { TagListInput } from '@/components/ui/TagInput/TagListInput';
import { MAX_TAGS } from '@/lib/tagOptions';
import { Section } from './Section';
import styles from './teamForm.module.scss';

interface TagsSectionProps {
	values: TeamFormValues;
	groupType: string;
}

export function TagsSection({ values, groupType }: TagsSectionProps) {
	const tagsId = useId();
	const noun = groupType === 'Group Ride' ? 'group ride' : 'group';

	return (
		<Section
			title='Tags'
			description={`Add up to ${MAX_TAGS} tag words to help people find your ${noun}`}
		>
			<div className={`${styles.field} ${styles.fieldFull}`}>
				<label htmlFor={tagsId} className={styles.fieldLabel}>
					Tags
				</label>
				<TagListInput
					id={tagsId}
					name='tag'
					defaultValues={values.tags}
					placeholder='Start typing, like "women", "masters", or "downhill"'
				/>
			</div>
		</Section>
	);
}
