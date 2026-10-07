import Link from "next/link";
import styles from "./notFound.module.scss";
import { ArrowIcon } from '@/components/ArrowIcon/ArrowIcon';

export default function TeamNotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <p className={styles.code}>404</p>
        <h1>We couldn&rsquo;t find that team.</h1>
        <p className={styles.copy}>It may have been renamed, removed, or the link may be out of date.</p>
        <Link href="/search" className={styles.link}>
          <ArrowIcon direction='left' /> Back to search
        </Link>
      </div>
    </div>
  );
}
