export const stripInstagramHandle = (value: string) =>
	value.trim().replace(/^@+/, '');

export const formatInstagramHandle = (value: string) =>
	`@${stripInstagramHandle(value)}`;
