'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const LOCK_FALLBACK_MS = { smooth: 1200, instant: 150 };

export function useActiveSection(ids: string[]) {
	const [activeId, setActiveId] = useState(ids[0] ?? '');
	const lockedRef = useRef(false);
	const releaseRef = useRef<(() => void) | null>(null);
	const key = ids.join('|');

	useEffect(() => {
		const list = key ? key.split('|') : [];
		const elements = list
			.map((id) => document.getElementById(id))
			.filter((element): element is HTMLElement => element !== null);
		const last = elements[elements.length - 1];
		if (!last) return;

		const visible = new Set<string>();

		function recompute() {
			if (lockedRef.current) return;
			const current = [...elements]
				.reverse()
				.find((element) => visible.has(element.id));
			if (current) setActiveId(current.id);
		}

		const band = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) visible.add(entry.target.id);
					else visible.delete(entry.target.id);
				}
				recompute();
			},
			{ rootMargin: '-25% 0px -65% 0px' },
		);

		const end = new IntersectionObserver(
			([entry]) => {
				if (!entry || lockedRef.current) return;
				if (entry.isIntersecting) setActiveId(last.id);
				else recompute();
			},
			{ threshold: 1 },
		);

		elements.forEach((element) => band.observe(element));
		end.observe(last);

		return () => {
			band.disconnect();
			end.disconnect();
		};
	}, [key]);

	useEffect(() => () => releaseRef.current?.(), []);

	const select = useCallback((id: string, smooth: boolean) => {
		releaseRef.current?.();
		setActiveId(id);
		lockedRef.current = true;

		const interrupts = ['wheel', 'touchstart', 'keydown'] as const;
		const timer = window.setTimeout(
			() => releaseRef.current?.(),
			smooth ? LOCK_FALLBACK_MS.smooth : LOCK_FALLBACK_MS.instant,
		);

		function release() {
			lockedRef.current = false;
			window.clearTimeout(timer);
			window.removeEventListener('scrollend', release);
			interrupts.forEach((name) => window.removeEventListener(name, release));
			releaseRef.current = null;
		}

		releaseRef.current = release;
		window.addEventListener('scrollend', release);
		interrupts.forEach((name) =>
			window.addEventListener(name, release, { passive: true }),
		);

		document
			.getElementById(id)
			?.scrollIntoView({
				behavior: smooth ? 'smooth' : 'auto',
				block: 'start',
			});
	}, []);

	return { activeId, select };
}
