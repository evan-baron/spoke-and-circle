import { describe, expect, it } from 'vitest';
import {
	isValidTag,
	MAX_TAGS,
	normalizeTag,
	TAG_OPTIONS,
} from './tagOptions';

describe('normalizeTag', () => {
	it('lowercases, trims and collapses inner whitespace', () => {
		expect(normalizeTag('  Women   ONLY ')).toBe('women only');
		expect(normalizeTag('Masters')).toBe('masters');
		expect(normalizeTag('   ')).toBe('');
	});
});

describe('isValidTag', () => {
	it('accepts one- and two-word tags', () => {
		for (const tag of [
			'masters',
			'women only',
			'beginner-friendly',
			'50+',
			"women's team",
			'out-and-back',
		]) {
			expect(isValidTag(tag)).toBe(true);
		}
	});

	it('rejects empty, three-word, over-long and odd-character tags', () => {
		for (const tag of [
			'',
			'three word tag',
			'x'.repeat(41),
			'no! way',
			'-leading',
			'Upper Case',
			'double  space',
		]) {
			expect(isValidTag(tag)).toBe(false);
		}
	});
});

describe('TAG_OPTIONS', () => {
	it('is sorted case-insensitively with no duplicates', () => {
		const sorted = [...TAG_OPTIONS].sort((a, b) =>
			a.toLowerCase() < b.toLowerCase() ? -1
			: a.toLowerCase() > b.toLowerCase() ? 1
			: 0,
		);
		expect(TAG_OPTIONS).toEqual(sorted);
		expect(new Set(TAG_OPTIONS).size).toBe(TAG_OPTIONS.length);
	});

	it('only contains tags that are valid and already normalized', () => {
		for (const tag of TAG_OPTIONS) {
			expect(normalizeTag(tag)).toBe(tag);
			expect(isValidTag(tag)).toBe(true);
		}
	});

	it('exposes the tag limit used by the form', () => {
		expect(MAX_TAGS).toBe(10);
	});
});
