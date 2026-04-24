import { listTrainers } from "@/db/queries/trainers";

const COLOR_MAP: Record<string, string> = {
  A: "#FD6DBB", B: "#34FDFE", C: "#a78bfa", D: "#4ade80", E: "#fb923c",
  F: "#FD6DBB", G: "#34FDFE", H: "#a78bfa", I: "#4ade80", J: "#FD6DBB",
  K: "#34FDFE", L: "#a78bfa", M: "#4ade80", N: "#fb923c", O: "#FD6DBB",
  P: "#34FDFE", Q: "#a78bfa", R: "#4ade80", S: "#FD6DBB", T: "#34FDFE",
  U: "#a78bfa", V: "#4ade80", W: "#fb923c", X: "#FD6DBB", Y: "#34FDFE",
  Z: "#a78bfa",
};

function colorFor(name: string) {
  return COLOR_MAP[name[0]?.toUpperCase()] ?? "#FD6DBB";
}

export default async function TrainersPage() {
  const trainers = await listTrainers({ limit: 100, offset: 0 });

  return (
    <div className="crm-page">
      <div className="crm-page-header">
        <div>
          <div className="crm-page-title">Trainers</div>
          <div className="crm-page-sub">{trainers.length} trainers on your team</div>
        </div>
      </div>

      <div className="crm-trainer-grid">
        {trainers.map((t) => {
          const color = colorFor(t.name);
          const initial = t.name[0]?.toUpperCase() ?? "?";
          return (
            <div key={t.id} className="crm-trainer-card">
              <div
                className="crm-trainer-avatar"
                style={{
                  background: `${color}18`,
                  border: `2px solid ${color}55`,
                  color,
                }}
              >
                {initial}
                <div className="crm-trainer-avatar-status" />
              </div>

              <div className="crm-trainer-name">{t.name}</div>
              <div className="crm-trainer-email">{t.email}</div>

              <div className="crm-trainer-stats">
                <div style={{ textAlign: "center" }}>
                  <div className="crm-trainer-stat-val" style={{ color }}>
                    {t.activeTraineeCount}
                  </div>
                  <div className="crm-trainer-stat-lbl">Clients</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div className="crm-trainer-stat-val" style={{ color }}>
                    {t.videoCount}
                  </div>
                  <div className="crm-trainer-stat-lbl">Videos</div>
                </div>
              </div>

              <button
                type="button"
                className="crm-trainer-btn"
                style={{
                  border: `1px solid ${color}55`,
                  color,
                }}
              >
                View Profile
              </button>
            </div>
          );
        })}
      </div>

      {trainers.length === 0 && (
        <div className="crm-table-empty">No trainers found.</div>
      )}
    </div>
  );
}
