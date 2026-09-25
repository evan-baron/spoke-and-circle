import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 320;
const CRANK_OPACITY = 0.1;
const CRANK_SCALE = 0.536;
const CRANK_X = 420;
const CRANK_Y = -110;
const GRADIENT_ANGLE_DEGREES = 135;
const GRADIENT_STOPS = [
	{ offset: '0%', color: '#402145' },
	{ offset: '60%', color: '#e75a50' },
	{ offset: '100%', color: '#f4aa34' },
];

function readCrankPath(): string {
	const source = readFileSync(
		join(process.cwd(), 'src', 'components', 'Graphics', 'Crank.tsx'),
		'utf8',
	);
	const match = source.match(/\bd='([^']+)'/);
	if (!match?.[1]) throw new Error('Could not find the crank path in Crank.tsx');
	return match[1];
}

function gradientLine() {
	const angle = (GRADIENT_ANGLE_DEGREES * Math.PI) / 180;
	const dx = Math.sin(angle);
	const dy = -Math.cos(angle);
	const length = Math.abs(WIDTH * dx) + Math.abs(HEIGHT * dy);
	const cx = WIDTH / 2;
	const cy = HEIGHT / 2;
	return {
		x1: cx - (dx * length) / 2,
		y1: cy - (dy * length) / 2,
		x2: cx + (dx * length) / 2,
		y2: cy + (dy * length) / 2,
	};
}

async function main() {
	const { x1, y1, x2, y2 } = gradientLine();
	const stops = GRADIENT_STOPS.map(
		(stop) => `<stop offset="${stop.offset}" stop-color="${stop.color}"/>`,
	).join('');

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
<defs><linearGradient id="hero" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops}</linearGradient></defs>
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#hero)"/>
<g transform="translate(${CRANK_X} ${CRANK_Y}) scale(${CRANK_SCALE})" fill="#ffffff" fill-opacity="${CRANK_OPACITY}">
<path fill-rule="evenodd" d="${readCrankPath()}"/>
</g>
</svg>`;

	const output = join(process.cwd(), 'public', 'email', 'header.png');
	await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(output);
	console.log(`Wrote ${output}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
