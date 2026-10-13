import { DetailSection } from '@/components/DetailSection/DetailSection';
import type { ParsedRouteLink } from '@/lib/routeLink';
import styles from './routeSection.module.scss';

interface RouteSectionProps {
	route: ParsedRouteLink;
	teamName: string;
}

export function RouteSection({ route, teamName }: RouteSectionProps) {
	return (
		<DetailSection title='Route'>
			<iframe
				src={route.embedSrc}
				title={`${teamName} route on ${route.provider}`}
				loading='lazy'
				sandbox='allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox'
				className={styles.frame}
			/>
		</DetailSection>
	);
}
