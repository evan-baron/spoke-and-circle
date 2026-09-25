'use client';

import { useState } from 'react';
import type { LocationOption } from '@/lib/types';
import { LocationInput } from './LocationInput';
import styles from './locationInput.module.scss';

const MAX_LOCATIONS = 10;

interface LocationListInputProps {
	id: string;
	name: string;
	placeholder?: string;
	defaultValues?: string[];
}

export function LocationListInput({
	id,
	name,
	placeholder,
	defaultValues = [],
}: LocationListInputProps) {
	const [locations, setLocations] = useState<LocationOption[]>(() =>
		defaultValues.map((label) => ({ placeId: label, label })),
	);
	const atLimit = locations.length >= MAX_LOCATIONS;

	function addLocation(item: LocationOption) {
		setLocations((prev) => {
			if (prev.length >= MAX_LOCATIONS) return prev;
			if (prev.some((location) => location.label === item.label)) return prev;
			return [...prev, item];
		});
	}

	function removeLocation(label: string) {
		setLocations((prev) => prev.filter((location) => location.label !== label));
	}

	return (
		<div className={styles.list}>
			<LocationInput
				id={id}
				placeholder={atLimit ? `Limit of ${MAX_LOCATIONS} reached` : placeholder}
				disabled={atLimit}
				onSelect={addLocation}
			/>
			{locations.length > 0 && (
				<ul className={styles.pills} aria-label='Added locations'>
					{locations.map((location) => (
						<li key={location.label} className={styles.pill}>
							<span>{location.label}</span>
							<button
								type='button'
								className={styles.pillRemove}
								aria-label={`Remove ${location.label}`}
								onClick={() => removeLocation(location.label)}
							>
								&times;
							</button>
							<input type='hidden' name={name} value={location.label} />
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
