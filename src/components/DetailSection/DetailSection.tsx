import styles from "./detailSection.module.scss";

interface DetailSectionProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

export function DetailSection({
  title,
  className,
  children,
}: DetailSectionProps) {
  return (
    <section
      className={className ? `${styles.section} ${className}` : styles.section}
    >
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.grid}>{children}</div>
    </section>
  );
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <div className={styles.rowValue}>{value}</div>
    </div>
  );
}
