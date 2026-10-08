import { randomBytes } from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';
import {
	MEDIA_FOLDER,
	MEDIA_FORMATS,
	MEDIA_UPLOAD_TAG,
	mediaOwnerPrefix,
} from '@/lib/media';

function readConfig() {
	const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
	const apiKey = process.env.CLOUDINARY_API_KEY;
	const apiSecret = process.env.CLOUDINARY_API_SECRET;
	if (!cloudName || !apiKey || !apiSecret) return null;
	return { cloudName, apiKey, apiSecret };
}

function configured() {
	const config = readConfig();
	if (!config) return null;
	cloudinary.config({
		cloud_name: config.cloudName,
		api_key: config.apiKey,
		api_secret: config.apiSecret,
		secure: true,
	});
	return config;
}

export function isMediaConfigured() {
	return readConfig() !== null;
}

export function mediaBaseUrl(publicId: string) {
	const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? '';
	return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}

export function signMediaUpload(userId: string) {
	const config = configured();
	if (!config) return null;

	const params = {
		asset_folder: `${MEDIA_FOLDER}/${userId}`,
		allowed_formats: MEDIA_FORMATS.join(','),
		overwrite: 'false',
		public_id: `${mediaOwnerPrefix(userId)}${randomBytes(12).toString('hex')}`,
		tags: MEDIA_UPLOAD_TAG,
		timestamp: Math.floor(Date.now() / 1000),
	};
	const signature = cloudinary.utils.api_sign_request(
		params,
		config.apiSecret,
	);

	return {
		cloudName: config.cloudName,
		apiKey: config.apiKey,
		signature,
		params,
	};
}

export interface UploadedImage {
	width: number;
	height: number;
	bytes: number;
	format: string;
}

export async function fetchUploadedImage(
	publicId: string,
): Promise<UploadedImage | null> {
	if (!configured()) return null;

	try {
		const resource = await cloudinary.api.resource(publicId, {
			resource_type: 'image',
		});
		return {
			width: resource.width,
			height: resource.height,
			bytes: resource.bytes,
			format: resource.format,
		};
	} catch {
		return null;
	}
}

export async function markImagesAttached(publicIds: string[]): Promise<void> {
	if (publicIds.length === 0 || !configured()) return;
	await cloudinary.uploader.remove_tag(MEDIA_UPLOAD_TAG, publicIds);
}

export async function destroyImages(publicIds: string[]): Promise<void> {
	if (publicIds.length === 0 || !configured()) return;
	await cloudinary.api.delete_resources(publicIds, {
		resource_type: 'image',
		type: 'upload',
	});
}

const DELETE_BATCH_SIZE = 100;

export async function deleteStaleUploads(maxAgeHours: number): Promise<number> {
	const stale = await listStaleUploads(maxAgeHours);
	for (let index = 0; index < stale.length; index += DELETE_BATCH_SIZE) {
		await destroyImages(stale.slice(index, index + DELETE_BATCH_SIZE));
	}
	return stale.length;
}

async function listStaleUploads(maxAgeHours: number): Promise<string[]> {
	if (!configured()) return [];

	const cutoff = Date.now() - maxAgeHours * 60 * 60 * 1000;
	const stale: string[] = [];
	let cursor: string | undefined;

	do {
		const page = await cloudinary.api.resources_by_tag(MEDIA_UPLOAD_TAG, {
			max_results: 500,
			next_cursor: cursor,
		});
		for (const resource of page.resources) {
			if (new Date(resource.created_at).getTime() < cutoff) {
				stale.push(resource.public_id);
			}
		}
		cursor = page.next_cursor;
	} while (cursor);

	return stale;
}
