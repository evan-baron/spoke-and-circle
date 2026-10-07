import {
	destroyImages,
	fetchUploadedImage,
	isMediaConfigured,
	markImagesAttached,
} from '@/lib/cloudinary';
import {
	MAX_MEDIA_BYTES,
	MAX_TEAM_MEDIA,
	MEDIA_FORMATS,
	mediaOwnerPrefix,
} from '@/lib/media';
import { prisma } from '@/lib/prisma';

export interface MediaActor {
	id: number;
	isAdmin: boolean;
}

export interface PreparedMedia {
	publicId: string;
	width: number;
	height: number;
	position: number;
}

export type PrepareMediaResult =
	| { rows: PreparedMedia[] | undefined }
	| { error: string };

export async function prepareTeamMedia(
	teamId: string | null,
	publicIds: string[] | undefined,
	actor: MediaActor | undefined,
): Promise<PrepareMediaResult> {
	if (publicIds === undefined) return { rows: undefined };
	if (publicIds.length === 0) return { rows: [] };

	if (!actor) return { error: 'Sign in to add photos' };
	if (new Set(publicIds).size !== publicIds.length) {
		return { error: 'Duplicate photos' };
	}
	if (publicIds.length > MAX_TEAM_MEDIA) {
		return { error: `Add up to ${MAX_TEAM_MEDIA} photos` };
	}
	if (!isMediaConfigured()) return { error: 'Photo uploads are unavailable' };

	const existing = await prisma.teamMedia.findMany({
		where: { publicId: { in: publicIds } },
		select: { publicId: true, teamId: true, width: true, height: true },
	});
	const known = new Map(existing.map((row) => [row.publicId, row]));

	const rows: PreparedMedia[] = [];
	for (const [position, publicId] of publicIds.entries()) {
		const current = known.get(publicId);
		if (current) {
			if (current.teamId !== teamId) {
				return { error: 'That photo is already used by another team' };
			}
			rows.push({
				publicId,
				width: current.width,
				height: current.height,
				position,
			});
			continue;
		}

		if (!actor.isAdmin && !publicId.startsWith(mediaOwnerPrefix(actor.id))) {
			return { error: 'Photo upload could not be verified' };
		}

		const image = await fetchUploadedImage(publicId);
		if (!image || !MEDIA_FORMATS.includes(image.format)) {
			return { error: 'Photo upload could not be verified' };
		}
		if (image.bytes > MAX_MEDIA_BYTES) {
			await destroyImages([publicId]).catch(() => undefined);
			return { error: 'Photos must be 5 MB or smaller' };
		}
		rows.push({
			publicId,
			width: image.width,
			height: image.height,
			position,
		});
	}

	return { rows };
}

export async function saveTeamMedia(
	teamId: string,
	rows: PreparedMedia[] | undefined,
): Promise<void> {
	if (rows === undefined) return;

	const keep = rows.map((row) => row.publicId);
	const before = await prisma.teamMedia.findMany({
		where: { teamId },
		select: { publicId: true },
	});
	const beforeIds = new Set(before.map((row) => row.publicId));
	const removed = [...beforeIds].filter((id) => !keep.includes(id));
	const added = keep.filter((id) => !beforeIds.has(id));

	await prisma.$transaction([
		prisma.teamMedia.deleteMany({
			where: { teamId, publicId: { notIn: keep } },
		}),
		...rows.map((row) =>
			prisma.teamMedia.upsert({
				where: { publicId: row.publicId },
				create: { teamId, ...row },
				update: { position: row.position },
			}),
		),
	]);

	await Promise.all([
		destroyImages(removed).catch((error) =>
			console.error('Failed to delete team media:', error),
		),
		markImagesAttached(added).catch((error) =>
			console.error('Failed to tag team media:', error),
		),
	]);
}

export async function listTeamMediaIds(teamId: string): Promise<string[]> {
	const rows = await prisma.teamMedia.findMany({
		where: { teamId },
		select: { publicId: true },
	});
	return rows.map((row) => row.publicId);
}

export async function destroyTeamMedia(publicIds: string[]): Promise<void> {
	try {
		await destroyImages(publicIds);
	} catch (error) {
		console.error('Failed to delete team media:', error);
	}
}
