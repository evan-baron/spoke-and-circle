import Link from "next/link";
import styles from "./notFound.module.scss";

export default function TeamNotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <p className={styles.code}>404</p>
        <h1>We couldn&rsquo;t find that team.</h1>
        <p className={styles.copy}>It may have been renamed, disbanded, or never existed in this sample data.</p>
        <Link href="/search" className={styles.link}>
          &larr; Back to search
        </Link>
      </div>
    </main>
  );
}
