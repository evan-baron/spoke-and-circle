'use client';

import { useState } from 'react';
import { describeRouteLink, type RouteLinkStatus } from '@/lib/routeLink';
import { Field } from './Field';
import styles from './teamForm.module.scss';

interface RouteLinkFieldProps {
	defaultValue: string;
}

function statusMessage(status: RouteLinkStatus): string {
	if (status.kind === 'map') {
		return `\u2713 We'll show an interactive map from ${status.provider} on your ride page.`;
	}
	if (status.kind === 'wrong-page') {
		return `This is a ${status.provider} link, but not to a route, so it won't show a map. Open the route itself and copy that link.`;
	}
	return 'This will show as a plain link. Use a Ride with GPS, Strava or Komoot route link to show a map.';
}

export function RouteLinkField({ defaultValue }: RouteLinkFieldProps) {
	const [value, setValue] = useState(defaultValue);
	const status = describeRouteLink(value);

	return (
		<Field
			label='Route link'
			hint="Paste a Ride with GPS, Strava, or Komoot route link and we'll show an interactive map of the route on your ride page. The route needs to be public."
			maxLength={500}
			full
		>
			<input
				type='url'
				name='routeLink'
				value={value}
				onChange={(event) => setValue(event.target.value)}
				maxLength={500}
				placeholder='https://ridewithgps.com/routes/...'
				className={styles.input}
			/>
			{status && (
				<span
					role='status'
					className={
						status.kind === 'map' ?
							`${styles.routeStatus} ${styles.routeStatusGood}`
						:	styles.routeStatus
					}
				>
					{statusMessage(status)}
				</span>
			)}
		</Field>
	);
}
