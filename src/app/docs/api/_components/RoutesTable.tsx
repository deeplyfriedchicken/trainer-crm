"use client";

import { Badge } from "@/app/components/Badge";
import type { NeonColorScheme } from "@/app/components/Button";
import { type ColumnDef, Table } from "@/app/components/Table";
import type { HttpMethod, RouteAuth, RouteDoc } from "@/lib/docs/parsers";

type RouteRow = {
  id: string;
  method: HttpMethod;
  path: string;
  auth: RouteAuth;
  roles: string;
  source: string;
};

const METHOD_COLOR: Record<HttpMethod, NeonColorScheme> = {
  GET: "cyan",
  POST: "pink",
  PUT: "pink",
  PATCH: "pink",
  DELETE: "pink",
  OPTIONS: "cyan",
  HEAD: "cyan",
};

const AUTH_LABEL: Record<RouteAuth, string> = {
  "session-or-bearer": "session / bearer",
  "bearer-only": "bearer",
  "sns-signature": "sns signature",
  public: "public",
};

export function RoutesTable({ routes }: { routes: RouteDoc[] }) {
  const rows: RouteRow[] = routes.flatMap((r) =>
    (r.methods.length > 0 ? r.methods : [" " as HttpMethod]).map((method) => ({
      id: `${r.urlPath}-${method}`,
      method,
      path: r.urlPath,
      auth: r.auth,
      roles: r.roles.length > 0 ? r.roles.join(", ") : "—",
      source: r.sourcePath,
    })),
  );

  const columns: ColumnDef<RouteRow>[] = [
    {
      key: "method",
      label: "Method",
      render: (row) => (
        <Badge
          colorScheme={METHOD_COLOR[row.method] ?? "pink"}
          variant="subtle"
        >
          {row.method.trim() || "—"}
        </Badge>
      ),
    },
    {
      key: "path",
      label: "Path",
      render: (row) => (
        <span style={{ fontFamily: "var(--font-neon-mono), monospace" }}>
          {row.path}
        </span>
      ),
    },
    {
      key: "auth",
      label: "Auth",
      render: (row) => (
        <span style={{ color: "var(--neon-text-muted)" }}>
          {AUTH_LABEL[row.auth]}
        </span>
      ),
    },
    {
      key: "roles",
      label: "Roles",
      render: (row) => (
        <span
          style={{
            color:
              row.roles === "—"
                ? "var(--neon-text-dim)"
                : "var(--neon-text-muted)",
            fontFamily: "var(--font-neon-mono), monospace",
            fontSize: 12,
          }}
        >
          {row.roles}
        </span>
      ),
    },
    {
      key: "source",
      label: "Source",
      render: (row) => (
        <span
          style={{
            color: "var(--neon-text-dim)",
            fontFamily: "var(--font-neon-mono), monospace",
            fontSize: 11,
          }}
        >
          {row.source}
        </span>
      ),
    },
  ];

  return (
    <Table
      rows={rows}
      columns={columns}
      getRowKey={(r) => r.id}
      defaultSortKey="path"
      emptyText="No API routes detected."
    />
  );
}
