"use client";

import { useState } from "react";
import { LuSearch } from "react-icons/lu";
import { type ColumnDef, Table } from "@/app/components/Table";

type Trainee = {
  id: string;
  name: string;
  email: string;
  sessionCount: number;
  lastSessionAt: Date | null;
  trainerName: string | null;
  createdAt: Date;
};

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

function formatDate(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const COLUMNS: ColumnDef<Trainee>[] = [
  {
    key: "name",
    label: "Name",
    render: (row) => {
      const color = colorFor(row.name);
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: `${color}18`,
              border: `1.5px solid ${color}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color,
              flexShrink: 0,
              fontFamily: "var(--font-crm-display), 'Barlow Condensed', sans-serif",
            }}
          >
            {row.name[0]?.toUpperCase() ?? "?"}
          </div>
          <span style={{ color: "#fff", fontWeight: 600 }}>{row.name}</span>
        </div>
      );
    },
  },
  {
    key: "email",
    label: "Email",
    render: (row) => (
      <span style={{ color: "rgba(255,255,255,0.5)" }}>{row.email}</span>
    ),
  },
  {
    key: "sessionCount",
    label: "Sessions",
    render: (row) => (
      <span
        style={{
          color: "rgba(255,255,255,0.7)",
          fontFamily: "var(--font-neon-mono), 'Space Mono', monospace",
          fontSize: 12,
        }}
      >
        {row.sessionCount}
      </span>
    ),
  },
  {
    key: "lastSessionAt",
    label: "Last Session",
    render: (row) => (
      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
        {formatDate(row.lastSessionAt)}
      </span>
    ),
  },
  {
    key: "trainerName",
    label: "Trainer",
    render: (row) => (
      <span style={{ color: "rgba(255,255,255,0.5)" }}>
        {row.trainerName ?? "—"}
      </span>
    ),
  },
  {
    key: "createdAt",
    label: "Joined",
    render: (row) => (
      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
        {formatDate(row.createdAt)}
      </span>
    ),
  },
];

export function TraineeTable({ trainees }: { trainees: Trainee[] }) {
  const [search, setSearch] = useState("");

  const filtered = trainees.filter((t) =>
    `${t.name} ${t.email}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="crm-page-header" style={{ marginBottom: 16 }}>
        <div>
          <div className="crm-page-title">Clients</div>
          <div className="crm-page-sub">
            {trainees.length} total · click any row to view profile
          </div>
        </div>
        <div className="crm-table-search">
          <div className="crm-table-search-icon">
            <LuSearch size={13} />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients…"
          />
        </div>
      </div>

      <Table
        columns={COLUMNS}
        rows={filtered}
        getRowKey={(t) => t.id}
        defaultSortKey="name"
        emptyText="No clients match your search."
      />
    </>
  );
}
