import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/siteConfig';

const AI_CRAWLERS = [
	'GPTBot',
	'OAI-SearchBot',
	'ChatGPT-User',
	'ClaudeBot',
	'Claude-SearchBot',
	'Claude-User',
	'PerplexityBot',
	'Perplexity-User',
	'Google-Extended',
	'Applebot-Extended',
	'CCBot',
];

const DISALLOWED_PATHS = ['/admin/', '/api/', '/auth/'];

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{ userAgent: '*', allow: '/', disallow: DISALLOWED_PATHS },
			{ userAgent: AI_CRAWLERS, allow: '/', disallow: DISALLOWED_PATHS },
		],
		sitemap: `${getSiteUrl()}/sitemap.xml`,
	};
}
