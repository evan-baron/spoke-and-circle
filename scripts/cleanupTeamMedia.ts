import 'dotenv/config';
import { deleteStaleUploads } from '../src/lib/cloudinary';

deleteStaleUploads(24)
	.then((count) => console.log(`Deleted ${count} unattached uploads`))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
