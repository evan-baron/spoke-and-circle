import styles from "./badge.module.scss";

export type BadgeTone = "forest" | "rust" | "gold" | "ink";

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
}

export function Badge({ children, tone = "ink" }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}
