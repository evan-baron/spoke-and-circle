'use client';

import Link from 'next/link';
import {
	type ChangeEvent,
	type DragEvent,
	useEffect,
	useRef,
	useState,
} from 'react';
import {
	MAX_MEDIA_BYTES,
	MAX_TEAM_MEDIA,
	MEDIA_ACCEPT,
	mediaSrc,
} from '@/lib/media';
import type { TeamMediaItem } from '@/lib/types';
import { Section } from './Section';
import styles from './mediaSection.module.scss';
import { ArrowIcon } from '@/components/ArrowIcon/ArrowIcon';

interface MediaSectionProps {
	initialMedia: TeamMediaItem[];
	canUpload: boolean;
	submitting: boolean;
	onUploadingChange: (uploading: boolean) => void;
}

interface MediaEntry {
	key: string;
	publicId?: string;
	pendingId?: string;
	isNew: boolean;
	src: string;
	status: 'uploading' | 'done' | 'error';
	progress: number;
	error?: string;
}

interface SignedUpload {
	cloudName: string;
	apiKey: string;
	signature: string;
	params: Record<string, string | number>;
}

const ALLOWED_TYPES = MEDIA_ACCEPT.split(',');

async function requestSignature(): Promise<SignedUpload> {
	const response = await fetch('/api/media/sign', { method: 'POST' });
	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(data.error ?? 'Could not start the upload');
	}
	return data as SignedUpload;
}

async function discardUpload(publicId: string) {
	try {
		await fetch('/api/media', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ publicId }),
			keepalive: true,
		});
	} catch {
		return;
	}
}

function sendToCloudinary(
	file: File,
	signed: SignedUpload,
	onProgress: (percent: number) => void,
	onRequest: (request: XMLHttpRequest) => void,
): Promise<string> {
	return new Promise((resolve, reject) => {
		const form = new FormData();
		form.append('file', file);
		form.append('api_key', signed.apiKey);
		form.append('signature', signed.signature);
		for (const [name, value] of Object.entries(signed.params)) {
			form.append(name, String(value));
		}

		const request = new XMLHttpRequest();
		onRequest(request);
		request.open(
			'POST',
			`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
		);
		request.upload.onprogress = (event) => {
			if (event.lengthComputable) {
				onProgress(Math.round((event.loaded / event.total) * 100));
			}
		};
		request.onload = () => {
			try {
				const body = JSON.parse(request.responseText);
				if (request.status >= 200 && request.status < 300 && body.public_id) {
					resolve(body.public_id as string);
					return;
				}
				reject(new Error(body.error?.message ?? 'Upload failed'));
			} catch {
				reject(new Error('Upload failed'));
			}
		};
		request.onerror = () => reject(new Error('Upload failed'));
		request.onabort = () => reject(new Error('Upload cancelled'));
		request.send(form);
	});
}

export function MediaSection({
	initialMedia,
	canUpload,
	submitting,
	onUploadingChange,
}: MediaSectionProps) {
	const [entries, setEntries] = useState<MediaEntry[]>(() =>
		initialMedia.map((item) => ({
			key: item.publicId,
			publicId: item.publicId,
			isNew: false,
			src: mediaSrc(item.url, 480),
			status: 'done',
			progress: 100,
		})),
	);
	const [notice, setNotice] = useState('');
	const [dragging, setDragging] = useState(false);
	const requests = useRef(new Map<string, XMLHttpRequest>());
	const objectUrls = useRef(new Set<string>());

	const uploading = entries.some((entry) => entry.status === 'uploading');

	useEffect(() => {
		onUploadingChange(uploading);
	}, [uploading, onUploadingChange]);

	const entriesRef = useRef(entries);
	const submittingRef = useRef(submitting);

	useEffect(() => {
		entriesRef.current = entries;
		submittingRef.current = submitting;
	});

	useEffect(() => {
		const pending = requests.current;
		const urls = objectUrls.current;

		function discardUnsaved() {
			if (submittingRef.current) return;
			for (const entry of entriesRef.current) {
				if (!entry.isNew) continue;
				pending.get(entry.key)?.abort();
				const publicId = entry.publicId ?? entry.pendingId;
				if (publicId) void discardUpload(publicId);
			}
		}

		function handlePageShow(event: PageTransitionEvent) {
			if (event.persisted) {
				setEntries((current) => current.filter((entry) => !entry.isNew));
			}
		}

		window.addEventListener('pagehide', discardUnsaved);
		window.addEventListener('pageshow', handlePageShow);

		return () => {
			window.removeEventListener('pagehide', discardUnsaved);
			window.removeEventListener('pageshow', handlePageShow);
			discardUnsaved();
			pending.forEach((request) => request.abort());
			urls.forEach((url) => URL.revokeObjectURL(url));
		};
	}, []);

	function patchEntry(key: string, patch: Partial<MediaEntry>) {
		setEntries((current) =>
			current.map((entry) =>
				entry.key === key ? { ...entry, ...patch } : entry,
			),
		);
	}

	async function upload(file: File, key: string) {
		try {
			const signed = await requestSignature();
			patchEntry(key, { pendingId: String(signed.params.public_id) });
			const publicId = await sendToCloudinary(
				file,
				signed,
				(progress) => patchEntry(key, { progress }),
				(request) => requests.current.set(key, request),
			);
			patchEntry(key, { publicId, status: 'done', progress: 100 });
		} catch (error) {
			patchEntry(key, {
				status: 'error',
				error: error instanceof Error ? error.message : 'Upload failed',
			});
		} finally {
			requests.current.delete(key);
		}
	}

	function addFiles(files: File[]) {
		const room = MAX_TEAM_MEDIA - entries.length;
		const messages: string[] = [];
		const accepted: File[] = [];

		for (const file of files) {
			if (!ALLOWED_TYPES.includes(file.type)) {
				messages.push(`${file.name} is not a JPG, PNG or WebP image`);
			} else if (file.size > MAX_MEDIA_BYTES) {
				messages.push(`${file.name} is larger than 5 MB`);
			} else {
				accepted.push(file);
			}
		}
		if (accepted.length > room) {
			messages.push(`You can add up to ${MAX_TEAM_MEDIA} photos`);
		}

		const created = accepted.slice(0, Math.max(room, 0)).map((file) => {
			const src = URL.createObjectURL(file);
			objectUrls.current.add(src);
			const entry: MediaEntry = {
				key: crypto.randomUUID(),
				isNew: true,
				src,
				status: 'uploading',
				progress: 0,
			};
			return { file, entry };
		});

		setNotice(messages.join('. '));
		if (created.length === 0) return;
		setEntries((current) => [...current, ...created.map(({ entry }) => entry)]);
		created.forEach(({ file, entry }) => void upload(file, entry.key));
	}

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		addFiles(Array.from(event.target.files ?? []));
		event.target.value = '';
	}

	function handleDrop(event: DragEvent<HTMLLabelElement>) {
		event.preventDefault();
		setDragging(false);
		addFiles(Array.from(event.dataTransfer.files));
	}

	function removeEntry(key: string) {
		const removed = entries.find((entry) => entry.key === key);
		requests.current.get(key)?.abort();
		setNotice('');

		if (removed?.isNew) {
			const publicId = removed.publicId ?? removed.pendingId;
			if (publicId) void discardUpload(publicId);
			if (objectUrls.current.delete(removed.src)) {
				URL.revokeObjectURL(removed.src);
			}
		}

		setEntries((current) => current.filter((entry) => entry.key !== key));
	}

	function moveEntry(index: number, direction: -1 | 1) {
		setEntries((current) => {
			const target = index + direction;
			if (target < 0 || target >= current.length) return current;
			const next = [...current];
			const [moved] = next.splice(index, 1);
			if (moved) next.splice(target, 0, moved);
			return next;
		});
	}

	if (!canUpload) {
		return (
			<Section
				title='Photos'
				description='Show riders what your group looks like'
			>
				<p className={`${styles.signIn} ${styles.full}`}>
					<Link href='/auth/login?returnTo=/teams/new'>Sign in</Link> to add
					photos. You can also add them later by editing your listing.
				</p>
			</Section>
		);
	}

	const doneIds = entries.flatMap((entry) =>
		entry.status === 'done' && entry.publicId ? [entry.publicId] : [],
	);
	const isFull = entries.length >= MAX_TEAM_MEDIA;

	return (
		<Section
			title='Photos'
			description={`Add up to ${MAX_TEAM_MEDIA} photos of your group. JPG, PNG or WebP, 5 MB each. The first photo is the main one.`}
		>
			<div className={`${styles.body} ${styles.full}`}>
				<input type='hidden' name='media' value={JSON.stringify(doneIds)} />

				{entries.length > 0 && (
					<ul className={styles.grid}>
						{entries.map((entry, index) => (
							<li key={entry.key} className={styles.tile}>
								<div className={styles.thumb}>
									<img src={entry.src} alt='' />
									{entry.status === 'uploading' && (
										<div className={styles.overlay}>
											<span>{entry.progress}%</span>
											<progress value={entry.progress} max={100} />
										</div>
									)}
									{entry.status === 'error' && (
										<div className={`${styles.overlay} ${styles.overlayError}`}>
											<span>{entry.error}</span>
										</div>
									)}
									{index === 0 && entry.status === 'done' && (
										<span className={styles.mainBadge}>Main</span>
									)}
								</div>
								<div className={styles.tileActions}>
									<button
										type='button'
										onClick={() => moveEntry(index, -1)}
										disabled={index === 0}
										aria-label={`Move photo ${index + 1} earlier`}
									>
										<ArrowIcon direction='left' />
									</button>
									<button
										type='button'
										onClick={() => moveEntry(index, 1)}
										disabled={index === entries.length - 1}
										aria-label={`Move photo ${index + 1} later`}
									>
										<ArrowIcon direction='right' />
									</button>
									<button
										type='button'
										onClick={() => removeEntry(entry.key)}
										aria-label={`Remove photo ${index + 1}`}
										className={styles.remove}
									>
										Remove
									</button>
								</div>
							</li>
						))}
					</ul>
				)}

				{!isFull && (
					<label
						className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
						onDragOver={(event) => {
							event.preventDefault();
							setDragging(true);
						}}
						onDragLeave={() => setDragging(false)}
						onDrop={handleDrop}
					>
						<input
							type='file'
							accept={MEDIA_ACCEPT}
							multiple
							onChange={handleChange}
							className={styles.fileInput}
						/>
						<span className={styles.dropTitle}>
							Choose photos or drag them here
						</span>
						<span className={styles.dropHint}>
							{entries.length} of {MAX_TEAM_MEDIA} added
						</span>
					</label>
				)}

				{notice && (
					<p className={styles.notice} role='alert'>
						{notice}
					</p>
				)}
			</div>
		</Section>
	);
}
