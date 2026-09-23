export const queryKeys = {
	teams: {
		root: () => ['teams'] as const,
		all: () => ['teams', 'list'] as const,
	},
} as const;
