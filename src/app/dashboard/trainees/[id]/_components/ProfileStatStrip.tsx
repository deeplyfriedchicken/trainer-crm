import styles from "./ProfileStatStrip.module.css";

export type StatEntry = { label: string; value: string; color?: string };

export function ProfileStatStrip({ stats }: { stats: StatEntry[] }) {
  return (
    <div className={styles.strip}>
      {stats.map((s) => (
        <div key={s.label} className={styles.cell}>
          <div className={styles.value} style={{ color: s.color ?? "rgba(255,255,255,0.6)" }}>
            {s.value}
          </div>
          <div className={styles.label}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}
