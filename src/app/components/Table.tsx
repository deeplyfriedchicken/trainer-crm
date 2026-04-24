"use client";

import { useState } from "react";
import styles from "./Table.module.css";

export type ColumnDef<T> = {
  key: keyof T & string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

type TableProps<T> = {
  columns: ColumnDef<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  defaultSortKey?: keyof T & string;
  emptyText?: string;
  onRowClick?: (row: T) => void;
};

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

function SortIndicator({ active, asc }: { active: boolean; asc: boolean }) {
  if (!active) return <span style={{ opacity: 0.3, fontSize: 10 }}>↕</span>;
  return <span style={{ fontSize: 10 }}>{asc ? "↑" : "↓"}</span>;
}

export function Table<T>({
  columns,
  rows,
  getRowKey,
  defaultSortKey,
  emptyText = "No data.",
  onRowClick,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T & string | null>(
    defaultSortKey ?? null,
  );
  const [asc, setAsc] = useState(true);

  function toggleSort(key: keyof T & string) {
    if (sortKey === key) setAsc((a) => !a);
    else {
      setSortKey(key);
      setAsc(true);
    }
  }

  const sorted = [...rows].sort((a, b) => {
    if (!sortKey) return 0;
    const cmp = compareValues(a[sortKey], b[sortKey]);
    return cmp * (asc ? 1 : -1);
  });

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`${styles.th}${sortKey === col.key ? ` ${styles.thSorted}` : ""}`}
                onClick={() => toggleSort(col.key)}
              >
                <span
                  style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
                >
                  {col.label}
                  <SortIndicator active={sortKey === col.key} asc={asc} />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={getRowKey(row)}
              className={`${styles.tr}${onRowClick ? ` ${styles.trClickable}` : ""}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className={styles.td}>
                  {col.render
                    ? col.render(row)
                    : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <div className={styles.empty}>{emptyText}</div>
      )}
    </div>
  );
}
