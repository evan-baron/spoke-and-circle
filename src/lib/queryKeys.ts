export const queryKeys = {
	teams: {
		root: () => ['teams'] as const,
		all: () => ['teams', 'list'] as const,
	},
	admin: {
		pendingCount: () => ['admin', 'pendingCount'] as const,
		teamsRoot: () => ['admin', 'teams'] as const,
		teams: (queryString: string) => ['admin', 'teams', queryString] as const,
	},
} as const;
