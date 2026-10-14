'use client';

import { useEffect, useId, useRef, useState } from 'react';
import styles from './routeSection.module.scss';

interface StravaRouteFrameProps {
	embedSrc: string;
	title: string;
}

const STRAVA_EMBED_ORIGIN = 'https://strava-embeds.com';
const HEIGHT_EVENT = 'BROADCAST_IFRAME_HEIGHT';
const MIN_HEIGHT_PX = 200;
const MAX_HEIGHT_PX = 2000;

export function StravaRouteFrame({ embedSrc, title }: StravaRouteFrameProps) {
	const frameRef = useRef<HTMLIFrameElement>(null);
	const namespace = `sc${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
	const [src, setSrc] = useState<string | undefined>(undefined);
	const [height, setHeight] = useState<number | null>(null);

	useEffect(() => {
		const hash = new URLSearchParams({
			ns: namespace,
			hostOrigin: window.location.origin,
			hostPath: window.location.pathname,
			hostTitle: document.title,
		});
		setSrc(`${embedSrc}#${hash.toString()}`);
	}, [embedSrc, namespace]);

	useEffect(() => {
		function handleMessage(event: MessageEvent) {
			if (event.origin !== STRAVA_EMBED_ORIGIN) return;
			if (event.source !== frameRef.current?.contentWindow) return;
			if (!Array.isArray(event.data)) return;

			const [ns, type, value] = event.data as unknown[];
			if (ns !== namespace || type !== HEIGHT_EVENT) return;
			if (typeof value !== 'number' || !Number.isFinite(value)) return;

			setHeight(Math.min(Math.max(value, MIN_HEIGHT_PX), MAX_HEIGHT_PX));
		}

		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	}, [namespace]);

	return (
		<iframe
			ref={frameRef}
			src={src}
			title={title}
			loading='lazy'
			sandbox='allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox'
			className={styles.frame}
			style={height === null ? undefined : { height: `${height}px` }}
		/>
	);
}
