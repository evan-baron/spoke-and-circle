"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const LAST_SEARCH_KEY = "lastSearchUrl";

// Records the current /search URL (with filters) so BackButton can return
// to it directly instead of relying on browser history or document.referrer,
// neither of which reflect client-side (soft) navigations reliably.
export function SearchLocationTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    try {
      sessionStorage.setItem(LAST_SEARCH_KEY, url);
    } catch {
      // sessionStorage unavailable (private browsing, etc.) — ignore
    }
  }, [pathname, searchParams]);

  return null;
}
