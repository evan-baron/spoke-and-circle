'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

type PendingExit = { kind: 'link'; href: string } | { kind: 'back' };

function isModifiedClick(event: MouseEvent) {
	return (
		event.button !== 0 ||
		event.metaKey ||
		event.ctrlKey ||
		event.shiftKey ||
		event.altKey
	);
}

export function useUnsavedChangesGuard(active: boolean) {
	const router = useRouter();
	const [prompting, setPrompting] = useState(false);
	const pendingRef = useRef<PendingExit | null>(null);
	const bypassRef = useRef(false);

	const requestExit = useCallback((exit: PendingExit) => {
		pendingRef.current = exit;
		setPrompting(true);
	}, []);

	useEffect(() => {
		if (!active) return;

		function handleBeforeUnload(event: BeforeUnloadEvent) {
			if (bypassRef.current) return;
			event.preventDefault();
			event.returnValue = '';
		}

		function handleClick(event: MouseEvent) {
			if (bypassRef.current || event.defaultPrevented || isModifiedClick(event)) {
				return;
			}
			if (!(event.target instanceof Element)) return;

			const anchor = event.target.closest('a[href]');
			if (!(anchor instanceof HTMLAnchorElement)) return;
			if (anchor.hasAttribute('download')) return;
			if (anchor.target && anchor.target !== '_self') return;

			const url = new URL(anchor.href, window.location.href);
			if (url.origin !== window.location.origin) return;
			if (
				url.pathname === window.location.pathname &&
				url.search === window.location.search
			) {
				return;
			}

			event.preventDefault();
			event.stopImmediatePropagation();
			requestExit({
				kind: 'link',
				href: `${url.pathname}${url.search}${url.hash}`,
			});
		}

		function handlePopState(event: PopStateEvent) {
			if (bypassRef.current) return;
			event.stopImmediatePropagation();
			window.history.pushState(window.history.state, '', window.location.href);
			requestExit({ kind: 'back' });
		}

		window.history.pushState(window.history.state, '', window.location.href);
		window.addEventListener('beforeunload', handleBeforeUnload);
		window.addEventListener('popstate', handlePopState, true);
		document.addEventListener('click', handleClick, true);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
			window.removeEventListener('popstate', handlePopState, true);
			document.removeEventListener('click', handleClick, true);
		};
	}, [active, requestExit]);

	const stay = useCallback(() => {
		pendingRef.current = null;
		setPrompting(false);
	}, []);

	const leave = useCallback(() => {
		const exit = pendingRef.current;
		pendingRef.current = null;
		bypassRef.current = true;
		setPrompting(false);
		if (!exit) return;

		if (exit.kind === 'link') {
			router.push(exit.href);
			return;
		}
		window.history.go(-2);
	}, [router]);

	return { prompting, stay, leave };
}
