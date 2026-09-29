export const queryKeys = {
	teams: {
		root: () => ['teams'] as const,
		all: () => ['teams', 'list'] as const,
	},
	admin: {
		pendingCount: () => ['admin', 'pendingCount'] as const,
	},
} as const;
