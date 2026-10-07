export const MAX_TEAM_MEDIA = 6;
export const MAX_MEDIA_BYTES = 5 * 1024 * 1024;
export const MEDIA_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
export const MEDIA_ACCEPT = 'image/jpeg,image/png,image/webp';
export const MEDIA_UPLOAD_TAG = 'pending-team-media';
export const MEDIA_FOLDER = 'assets/spoke_and_circle_uploads';
export const MEDIA_PUBLIC_ID_PATTERN =
	/^assets\/spoke_and_circle_uploads\/u\d+\/[A-Za-z0-9_-]{16,40}$/;

export function mediaOwnerPrefix(userId: number) {
	return `${MEDIA_FOLDER}/u${userId}/`;
}

export function mediaSrc(baseUrl: string, width: number) {
	return baseUrl.replace(
		'/upload/',
		`/upload/f_auto,q_auto,c_limit,w_${width}/`,
	);
}
