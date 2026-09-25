export type RateLimitBucket =
	| 'teams-read'
	| 'teams-write'
	| 'locations-search'
	| 'admin-write';

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
		windowSeconds: 3600,
		maxRequests: { anonymous: 3, user: 10, admin: 60 },
	},
	'admin-write': {
		windowSeconds: 60,
		maxRequests: { anonymous: 0, user: 0, admin: 60 },
	},
	'locations-search': {
		windowSeconds: 60,
		maxRequests: { anonymous: 60, user: 60, admin: 60 },
	},
};
