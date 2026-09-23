import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const dbUrl =
	process.env.NODE_ENV === 'production' ?
		(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL)
	:	process.env.DEVELOPMENT_DATABASE_URL;

if (!dbUrl) {
	throw new Error('Database URL environment variable is not set');
}

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations',
	},
	datasource: {
		url: dbUrl,
	},
});
