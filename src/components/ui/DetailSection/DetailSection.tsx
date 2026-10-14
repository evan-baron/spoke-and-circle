import styles from "./detailSection.module.scss";

interface DetailSectionProps {
  title: string;
  children: React.ReactNode;
}

export function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.grid}>{children}</div>
    </section>
  );
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  full?: boolean;
}

export function DetailRow({ label, value, full }: DetailRowProps) {
  return (
    <div className={full ? `${styles.row} ${styles.rowFull}` : styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <div className={styles.rowValue}>{value}</div>
    </div>
  );
}
