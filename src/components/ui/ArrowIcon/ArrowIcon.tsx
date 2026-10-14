interface ArrowIconProps {
	direction: 'left' | 'right' | 'up' | 'down';
}

const TRANSFORMS: Record<ArrowIconProps['direction'], string | undefined> = {
	left: undefined,
	right: 'scaleX(-1)',
	up: 'rotate(90deg)',
	down: 'rotate(-90deg)',
};

export function ArrowIcon({ direction }: ArrowIconProps) {
	return (
		<svg
			width='1em'
			height='1em'
			viewBox='0 0 16 16'
			fill='none'
			stroke='currentColor'
			strokeWidth='1.75'
			strokeLinecap='round'
			strokeLinejoin='round'
			aria-hidden='true'
			focusable='false'
			style={{ flexShrink: 0, transform: TRANSFORMS[direction] }}
		>
			<path d='M13 8H3M7.5 3.5L3 8l4.5 4.5' />
		</svg>
	);
}
