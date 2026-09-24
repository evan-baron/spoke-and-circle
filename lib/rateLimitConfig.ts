export type RateLimitBucket =
	| 'teams-read'
	| 'teams-write'
	| 'locations-search';

export type RateLimitActor = 'anonymous' | 'user' | 'admin';

interface BucketConfig {
	windowSeconds: number;
	maxRequests: Record<RateLimitActor, number>;
}

export const RATE_LIMIT_CONFIG: Record<RateLimitBucket, BucketConfig> = {
	'teams-read': {
		windowSeconds: 60,
		maxRequests: { anonymous: 60, user: 120, admin: 300 },
	},
	'teams-write': {
		windowSeconds: 600,
		maxRequests: { anonymous: 0, user: 5, admin: 60 },
	},
	'locations-search': {
		windowSeconds: 60,
		maxRequests: { anonymous: 10, user: 10, admin: 10 },
	},
};
