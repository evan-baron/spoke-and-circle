"use client";

import { useRouter } from "next/navigation";
import { LAST_SEARCH_KEY } from "@/components/SearchLocationTracker/SearchLocationTracker";
import styles from "./backButton.module.scss";
import { ArrowIcon } from "@/components/ArrowIcon/ArrowIcon";

export function BackButton() {
  const router = useRouter();

  function handleClick() {
    let target = "/search";
    try {
      target = sessionStorage.getItem(LAST_SEARCH_KEY) ?? target;
    } catch {
      // sessionStorage unavailable (private browsing, etc.) — use default
    }
    router.push(target);
  }

  return (
    <button type="button" onClick={handleClick} className={styles.back}>
      <ArrowIcon direction='left' /> Back to search
    </button>
  );
}
