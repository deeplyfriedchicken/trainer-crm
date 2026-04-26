import styles from "./ProfileAvatar.module.css";

type StatusColor = string; // e.g. "#4ade80" for active, "#fb923c" for inactive

export function ProfileAvatar({
  name,
  accentColor,
  statusColor,
}: {
  name: string;
  accentColor: string;
  statusColor?: StatusColor;
}) {
  const initial = name[0]?.toUpperCase() ?? "?";

  return (
    <div
      className={styles.avatar}
      style={{
        color: accentColor,
        background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)`,
        border: `3px solid ${accentColor}88`,
        boxShadow: `0 0 30px ${accentColor}33`,
      }}
    >
      {initial}
      {statusColor && (
        <div
          className={styles.statusDot}
          style={{ background: statusColor, boxShadow: `0 0 8px ${statusColor}` }}
        />
      )}
    </div>
  );
}
