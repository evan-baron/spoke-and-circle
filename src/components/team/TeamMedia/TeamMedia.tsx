'use client';

import { useRef, useState } from 'react';
import { mediaSrc } from '@/lib/media';
import type { TeamMediaItem } from '@/lib/types';
import styles from './teamMedia.module.scss';

interface TeamMediaProps {
	media: TeamMediaItem[];
	teamName: string;
}

export function TeamMedia({ media, teamName }: TeamMediaProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [active, setActive] = useState(0);

	if (media.length === 0) return null;

	const current = media[active] ?? media[0];

	function open(index: number) {
		setActive(index);
		dialogRef.current?.showModal();
	}

	function step(direction: -1 | 1) {
		setActive((index) => (index + direction + media.length) % media.length);
	}

	return (
		<section className={styles.section}>
			<h2 className={styles.title}>Photos</h2>
			<ul className={styles.grid}>
				{media.map((item, index) => (
					<li key={item.publicId} className={index === 0 ? styles.lead : ''}>
						<button
							type='button'
							className={styles.thumb}
							onClick={() => open(index)}
							aria-label={`View photo ${index + 1} of ${media.length}`}
						>
							<img
								src={mediaSrc(item.url, index === 0 ? 1000 : 500)}
								srcSet={`${mediaSrc(item.url, 500)} 500w, ${mediaSrc(item.url, 1000)} 1000w`}
								sizes={index === 0 ? '(min-width: 64rem) 40rem, 100vw' : '16rem'}
								width={item.width}
								height={item.height}
								alt={`${teamName} photo ${index + 1}`}
								loading={index === 0 ? 'eager' : 'lazy'}
							/>
						</button>
					</li>
				))}
			</ul>

			<dialog
				ref={dialogRef}
				className={styles.dialog}
				aria-label={`${teamName} photos`}
				onClick={(event) => {
					if (event.target === event.currentTarget) dialogRef.current?.close();
				}}
			>
				{current && (
					<img
						src={mediaSrc(current.url, 1600)}
						alt={`${teamName} photo ${active + 1}`}
						className={styles.full}
					/>
				)}
				<div className={styles.controls}>
					{media.length > 1 && (
						<button type='button' onClick={() => step(-1)}>
							&larr; Previous
						</button>
					)}
					<span>
						{active + 1} / {media.length}
					</span>
					{media.length > 1 && (
						<button type='button' onClick={() => step(1)}>
							Next &rarr;
						</button>
					)}
					<button type='button' onClick={() => dialogRef.current?.close()}>
						Close
					</button>
				</div>
			</dialog>
		</section>
	);
}
