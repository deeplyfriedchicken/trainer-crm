import { ProfileAvatar } from "./ProfileAvatar";
import styles from "./ProfileHero.module.css";
import { ProfileStatStrip, type StatEntry } from "./ProfileStatStrip";

export function ProfileHero({
  name,
  badge,
  meta,
  accentColor,
  statusColor,
  stats,
}: {
  name: string;
  badge?: string;
  meta?: string;
  accentColor: string;
  statusColor?: string;
  stats: StatEntry[];
}) {
  return (
    <div
      className={styles.hero}
      style={{
        background: "var(--neon-surface)",
        border: `1px solid ${accentColor}33`,
      }}
    >
      <div
        className={styles.accentBar}
        style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
      />
      <div
        className={styles.ambientGlow}
        style={{ background: `${accentColor}07` }}
      />

      <div className={styles.body}>
        <ProfileAvatar name={name} accentColor={accentColor} statusColor={statusColor} />

        <div className={styles.info}>
          <div className={styles.nameRow}>
            <h1 className={styles.name}>{name}</h1>
            {badge && (
              <span
                className={styles.badge}
                style={{
                  background: `${accentColor}22`,
                  color: accentColor,
                  border: `1px solid ${accentColor}44`,
                }}
              >
                {badge}
              </span>
            )}
          </div>
          {meta && <div className={styles.meta}>{meta}</div>}
        </div>

        <ProfileStatStrip stats={stats} />
      </div>
    </div>
  );
}
