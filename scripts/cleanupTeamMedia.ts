import 'dotenv/config';
import { destroyImages, listStaleUploads } from '../src/lib/cloudinary';

async function main() {
	const stale = await listStaleUploads(24);
	for (let index = 0; index < stale.length; index += 100) {
		await destroyImages(stale.slice(index, index + 100));
	}
	console.log(`Deleted ${stale.length} unattached uploads`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
