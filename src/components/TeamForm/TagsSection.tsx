import { useId } from 'react';
import type { TeamFormValues } from '@/lib/types';
import { TagListInput } from '@/components/TagInput/TagListInput';
import { MAX_TAGS } from '@/lib/tagOptions';
import { Section } from './Section';
import styles from './teamForm.module.scss';

interface TagsSectionProps {
	values: TeamFormValues;
}

export function TagsSection({ values }: TagsSectionProps) {
	const tagsId = useId();

	return (
		<Section
			title='Tags'
			description={`Add up to ${MAX_TAGS} tag words to help people find your group`}
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
