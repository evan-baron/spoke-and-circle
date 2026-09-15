import Link from "next/link";

export default function TeamNotFound() {
  return (
    <main>
      <div>
        <p>404</p>
        <h1>We couldn&rsquo;t find that team.</h1>
        <p>It may have been renamed, disbanded, or never existed in this sample data.</p>
        <Link href="/search">
          &larr; Back to search
        </Link>
      </div>
    </main>
  );
}
