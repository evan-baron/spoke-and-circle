interface ChevronProps {
	className?: string;
}

export function Chevron({ className }: ChevronProps) {
	return (
		<svg
			className={className}
			viewBox='0 0 12 8'
			width='9'
			height='6'
			fill='none'
			stroke='currentColor'
			strokeWidth='1.5'
			strokeLinecap='round'
			strokeLinejoin='round'
			aria-hidden='true'
		>
			<path d='M1 1.5 6 6.5 11 1.5' />
		</svg>
	);
}
