'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import styles from './mountainProgress.module.scss';

interface Point {
	x: number;
	y: number;
}

const STEP_COUNT = 4;
const DURATION_MS = 700;
const PALE = 'var(--color-line)';
const DEFAULT_WIDTH = 900;
const MAX_HEIGHT = 88;
const MIN_HEIGHT = 60;
const HEIGHT_RATIO = 0.14;
const BASE_POINTS: Point[] = [
	{ x: 4, y: 160 },
	{ x: 268, y: 106 },
	{ x: 323, y: 135 },
	{ x: 591, y: 80 },
	{ x: 896, y: 163 },
];
const BASE_MIN_Y = Math.min(...BASE_POINTS.map((point) => point.y));
const BASE_MAX_Y = Math.max(...BASE_POINTS.map((point) => point.y));
const FLAG_COLUMNS = 5;
const FLAG_ROWS = 2;

function heightForWidth(width: number) {
	return Math.min(Math.max(width * HEIGHT_RATIO, MIN_HEIGHT), MAX_HEIGHT);
}

function buildGeometry(width: number) {
	const height = heightForWidth(width);
	const unit = height / MAX_HEIGHT;
	const stroke = Math.max(6 * unit, 4.5);
	const gap = Math.max(10 * unit, 9);
	const bikeScale = Math.max(2.3 * unit, 1.3);
	const lift = stroke / 2;
	const inset = stroke / 2;
	const firstX = BASE_POINTS[0]?.x ?? 0;
	const lastX = BASE_POINTS[BASE_POINTS.length - 1]?.x ?? firstX + 1;

	const topPad = lift + 17 * bikeScale + 3;
	const bottomPad = stroke / 2 + 1;
	const relief = height - topPad - bottomPad;

	const points = BASE_POINTS.map((point) => ({
		x: inset + ((point.x - firstX) / (lastX - firstX)) * (width - 2 * inset),
		y: topPad + ((point.y - BASE_MIN_Y) / (BASE_MAX_Y - BASE_MIN_Y)) * relief,
	}));
	const endX = points[points.length - 1]?.x ?? width;

	const cumulative = points.reduce<number[]>((lengths, point, index) => {
		const previous = points[index - 1];
		const travelled = lengths[index - 1] ?? 0;
		lengths.push(
			previous ?
				travelled + Math.hypot(point.x - previous.x, point.y - previous.y)
			:	0,
		);
		return lengths;
	}, []);
	const total = cumulative[cumulative.length - 1] ?? 0;

	function lengthAtX(x: number) {
		for (let i = 1; i < points.length; i++) {
			const from = points[i - 1];
			const to = points[i];
			if (!from || !to || x > to.x) continue;
			const start = cumulative[i - 1] ?? 0;
			const end = cumulative[i] ?? 0;
			const t = Math.max((x - from.x) / (to.x - from.x), 0);
			return start + (end - start) * t;
		}
		return total;
	}

	function pointAt(length: number): Point {
		const clamped = Math.min(Math.max(length, 0), total);
		for (let i = 1; i < points.length; i++) {
			const from = points[i - 1];
			const to = points[i];
			const start = cumulative[i - 1] ?? 0;
			const end = cumulative[i] ?? 0;
			if (!from || !to || clamped > end) continue;
			const t = end === start ? 0 : (clamped - start) / (end - start);
			return {
				x: from.x + (to.x - from.x) * t,
				y: from.y + (to.y - from.y) * t,
			};
		}
		return points[0] ?? { x: 0, y: 0 };
	}

	const lineY = (x: number) => pointAt(lengthAtX(x)).y;

	const trim = gap / 2 + stroke / 2;
	const segments = Array.from({ length: STEP_COUNT }, (_, index) => {
		const isLast = index === STEP_COUNT - 1;
		const start =
			index === 0 ? 0 : lengthAtX((width * index) / STEP_COUNT) + trim;
		const end =
			isLast ? total : lengthAtX((width * (index + 1)) / STEP_COUNT) - trim;
		return {
			start,
			length: end - start,
			x1: pointAt(start).x,
			x2: isLast ? width : pointAt(end).x,
		};
	});

	const flagRightX = endX - 4 * unit;
	const flagLeftX = flagRightX - 70 * unit;
	const poleHeight = 36 * unit;
	const bannerHeight = 24 * unit;
	const rowHeight = bannerHeight / FLAG_ROWS;
	const flagLeft = {
		x: flagLeftX,
		bottom: lineY(flagLeftX),
		top: lineY(flagLeftX) - poleHeight,
	};
	const flagRight = {
		x: flagRightX,
		bottom: lineY(flagRightX),
		top: lineY(flagRightX) - poleHeight,
	};
	const flagSlope = (flagRight.top - flagLeft.top) / (flagRight.x - flagLeft.x);
	const flagTop = (x: number) => flagLeft.top + (x - flagLeft.x) * flagSlope;
	const cellWidth = (flagRight.x - flagLeft.x) / FLAG_COLUMNS;

	const flagSquares = Array.from(
		{ length: FLAG_COLUMNS * FLAG_ROWS },
		(_, cell) => ({
			column: cell % FLAG_COLUMNS,
			row: Math.floor(cell / FLAG_COLUMNS),
		}),
	)
		.filter(({ column, row }) => (column + row) % 2 === 0)
		.map(({ column, row }) => {
			const x0 = flagLeft.x + column * cellWidth;
			const x1 = x0 + cellWidth;
			const y0 = row * rowHeight;
			const y1 = y0 + rowHeight;
			return [
				`${x0},${flagTop(x0) + y0}`,
				`${x1},${flagTop(x1) + y0}`,
				`${x1},${flagTop(x1) + y1}`,
				`${x0},${flagTop(x0) + y1}`,
			].join(' ');
		});

	const flagOutline = [
		`${flagLeft.x},${flagLeft.top}`,
		`${flagRight.x},${flagRight.top}`,
		`${flagRight.x},${flagRight.top + bannerHeight}`,
		`${flagLeft.x},${flagLeft.top + bannerHeight}`,
	].join(' ');

	const halfWheelbase = (13 * bikeScale) / 2;

	function riderTransform(length: number) {
		const rear = pointAt(length - halfWheelbase);
		const front = pointAt(length + halfWheelbase);
		const angle =
			(Math.atan2(front.y - rear.y, front.x - rear.x) * 180) / Math.PI;
		const midX = (rear.x + front.x) / 2;
		const midY = (rear.y + front.y) / 2;
		return `translate(${midX} ${midY}) rotate(${angle}) translate(0 ${-lift}) scale(${bikeScale}) translate(-12 -21)`;
	}

	function lengthForStep(step: number) {
		const clamped = Math.min(Math.max(step, 0), STEP_COUNT - 1);
		return lengthAtX((width * (clamped + 0.5)) / STEP_COUNT);
	}

	return {
		width,
		height,
		stroke,
		linePath: `M${points.map((point) => `${point.x} ${point.y}`).join(' L')}`,
		total,
		segments,
		flag: {
			left: flagLeft,
			right: flagRight,
			poleStroke: Math.max(5 * unit, 3),
			outlineStroke: Math.max(3 * unit, 2),
			squares: flagSquares,
			outline: flagOutline,
		},
		riderTransform,
		lengthForStep,
	};
}

type Geometry = ReturnType<typeof buildGeometry>;

const Flag = ({ geometry, paint }: { geometry: Geometry; paint: string }) => {
	const { left, right, poleStroke, outlineStroke, squares, outline } =
		geometry.flag;

	return (
		<g>
			<g
				fill='none'
				stroke={paint}
				strokeWidth={poleStroke}
				strokeLinecap='round'
			>
				<path d={`M${left.x} ${left.top} V${left.bottom}`} />
				<path d={`M${right.x} ${right.top} V${right.bottom}`} />
			</g>
			<polygon
				points={outline}
				fill='none'
				stroke={paint}
				strokeWidth={outlineStroke}
				strokeLinejoin='round'
			/>
			{squares.map((points) => (
				<polygon key={points} points={points} fill={paint} />
			))}
		</g>
	);
};

function useContainerWidth(ref: React.RefObject<HTMLElement | null>) {
	const [width, setWidth] = useState(DEFAULT_WIDTH);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;
		const observer = new ResizeObserver(([entry]) => {
			const next = Math.round(entry?.contentRect.width ?? 0);
			if (next > 0) setWidth(next);
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, [ref]);

	return width;
}

interface MountainProgressProps {
	step?: number;
}

const MountainProgress = ({ step = 0 }: MountainProgressProps) => {
	const uid = useId().replace(/:/g, '');
	const segmentGradient = (index: number) => `climb${uid}${index}`;
	const riderGradient = `rider${uid}`;
	const wrapperRef = useRef<HTMLDivElement>(null);
	const riderRef = useRef<SVGGElement>(null);
	const width = useContainerWidth(wrapperRef);
	const geometry = useMemo(() => buildGeometry(width), [width]);
	const geometryRef = useRef(geometry);
	const lengthRef = useRef(geometry.lengthForStep(step));
	const [initialTransform] = useState(() =>
		geometry.riderTransform(lengthRef.current),
	);

	useEffect(() => {
		const rider = riderRef.current;
		if (!rider) return;
		const target = geometry.lengthForStep(step);

		if (geometryRef.current !== geometry) {
			geometryRef.current = geometry;
			lengthRef.current = target;
			rider.setAttribute('transform', geometry.riderTransform(target));
			return;
		}

		const from = lengthRef.current;
		if (from === target) return;

		const reduceMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)',
		).matches;
		if (reduceMotion) {
			lengthRef.current = target;
			rider.setAttribute('transform', geometry.riderTransform(target));
			return;
		}

		let frame = 0;
		const start = performance.now();

		function tick(now: number) {
			const progress = Math.min((now - start) / DURATION_MS, 1);
			const eased =
				progress < 0.5 ?
					2 * progress * progress
				:	1 - Math.pow(-2 * progress + 2, 2) / 2;
			const length = from + (target - from) * eased;
			lengthRef.current = length;
			rider?.setAttribute('transform', geometry.riderTransform(length));
			if (progress < 1) frame = requestAnimationFrame(tick);
		}

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [step, geometry]);

	const stops = (
		<>
			<stop offset='0' style={{ stopColor: 'var(--gradient-cta-from)' }} />
			<stop offset='1' style={{ stopColor: 'var(--gradient-cta-to)' }} />
		</>
	);

	return (
		<div ref={wrapperRef} className={styles.wrapper}>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				viewBox={`0 0 ${geometry.width} ${geometry.height}`}
				className={styles.mountain}
				aria-hidden='true'
				focusable='false'
			>
				<defs>
					{geometry.segments.map((segment, index) => (
						<linearGradient
							key={index}
							id={segmentGradient(index)}
							gradientUnits='userSpaceOnUse'
							x1={segment.x1}
							y1='0'
							x2={segment.x2}
							y2='0'
						>
							{stops}
						</linearGradient>
					))}
					<linearGradient
						id={riderGradient}
						gradientUnits='userSpaceOnUse'
						x1='2'
						y1='0'
						x2='22'
						y2='0'
					>
						{stops}
					</linearGradient>
				</defs>

				{geometry.segments.map((segment, index) => {
					const isLast = index === STEP_COUNT - 1;
					const dash = {
						d: geometry.linePath,
						pathLength: geometry.total,
						fill: 'none',
						strokeWidth: geometry.stroke,
						strokeLinecap: 'round' as const,
						strokeLinejoin: 'round' as const,
						strokeDasharray: `${segment.length} ${geometry.total}`,
						strokeDashoffset: -segment.start,
					};
					const paint = `url(#${segmentGradient(index)})`;

					return (
						<g key={index}>
							<g>
								<path {...dash} stroke={PALE} />
								{isLast && <Flag geometry={geometry} paint={PALE} />}
							</g>
							<g
								className={`${styles.fill} ${index <= step ? styles.fillOn : ''}`}
							>
								<path {...dash} stroke={paint} />
								{isLast && <Flag geometry={geometry} paint={paint} />}
							</g>
						</g>
					);
				})}

				<g
					ref={riderRef}
					transform={initialTransform}
					fill='none'
					stroke={`url(#${riderGradient})`}
					strokeWidth='1.7'
					strokeLinecap='round'
					strokeLinejoin='round'
				>
					<circle cx='18.5' cy='17.5' r='3.5' />
					<circle cx='5.5' cy='17.5' r='3.5' />
					<circle cx='15' cy='5' r='1' />
					<path d='M12 17.5V14l-3-3 4-3 2 3h2' />
				</g>
			</svg>
		</div>
	);
};

export default MountainProgress;
