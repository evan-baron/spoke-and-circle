export interface GazetteerRow {
	[column: string]: string;
}

const DESCRIPTORS = [
	'city and borough',
	'consolidated government',
	'metropolitan government',
	'metro government',
	'unified government',
	'urban county',
	'municipality',
	'comunidad',
	'zona urbana',
	'township',
	'borough',
	'village',
	'town',
	'city',
	'CDP',
];

const DESCRIPTOR_PATTERN = new RegExp(`\\s+(${DESCRIPTORS.join('|')})$`);

export function parseGazetteer(text: string): GazetteerRow[] {
	const [headerLine, ...lines] = text.split(/\r?\n/);
	if (!headerLine) return [];
	const headers = headerLine.split('\t').map((header) => header.trim());

	return lines
		.filter((line) => line.trim() !== '')
		.map((line) => {
			const cells = line.split('\t');
			return Object.fromEntries(
				headers.map((header, index) => [header, (cells[index] ?? '').trim()]),
			);
		});
}

export function cleanPlaceName(rawName: string): string {
	return rawName
		.replace(/\s*\(balance\)$/, '')
		.replace(DESCRIPTOR_PATTERN, '')
		.trim();
}
