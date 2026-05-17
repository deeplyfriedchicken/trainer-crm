"use client";

import { HStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LuSearch, LuTrash2, LuUserPlus } from "react-icons/lu";
import { Button } from "@/app/components/Button";
import { Dialog, DialogBody } from "@/app/components/Dialog";
import { Input } from "@/app/components/Input";
import { PageHeader } from "@/app/components/PageHeader";
import { type ColumnDef, Table } from "@/app/components/Table";
import type { TraineeRow } from "@/db/queries/trainees";
import { deleteTrainee } from "../trainees/actions";
import { usePermissions } from "../_hooks/usePermissions";
import { AddTraineeModal } from "./AddTraineeModal";

type Trainee = TraineeRow;

const COLOR_MAP: Record<string, string> = {
  A: "#FD6DBB",
  B: "#34FDFE",
  C: "#a78bfa",
  D: "#4ade80",
  E: "#fb923c",
  F: "#FD6DBB",
  G: "#34FDFE",
  H: "#a78bfa",
  I: "#4ade80",
  J: "#FD6DBB",
  K: "#34FDFE",
  L: "#a78bfa",
  M: "#4ade80",
  N: "#fb923c",
  O: "#FD6DBB",
  P: "#34FDFE",
  Q: "#a78bfa",
  R: "#4ade80",
  S: "#FD6DBB",
  T: "#34FDFE",
  U: "#a78bfa",
  V: "#4ade80",
  W: "#fb923c",
  X: "#FD6DBB",
  Y: "#34FDFE",
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
              fontFamily:
                "var(--font-crm-display), 'Barlow Condensed', sans-serif",
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
  const { canAddClient, canDeleteClient } = usePermissions();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Trainee | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = trainees.filter((t) =>
    `${t.name} ${t.email}`.toLowerCase().includes(search.toLowerCase()),
  );

  function confirmDelete() {
    if (!toDelete) return;
    startTransition(async () => {
      await deleteTrainee(toDelete.id);
      setToDelete(null);
    });
  }

  const columns: ColumnDef<Trainee>[] = [
    ...COLUMNS,
    ...(canDeleteClient
      ? [
          {
            key: "id" as const,
            label: "",
            render: (row: Trainee) => (
              <button
                type="button"
                aria-label={`Delete ${row.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setToDelete(row);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(248,113,113,0.5)",
                  padding: "4px 6px",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color =
                    "#f87171")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color =
                    "rgba(248,113,113,0.5)")
                }
              >
                <LuTrash2 size={14} />
              </button>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle={`${trainees.length} total · click any row to view profile`}
        action={
          <HStack>
            <LuSearch size={13} color="var(--color-text-dim)" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients…"
              colorScheme="cyan"
              size="sm"
              w="200px"
            />
            {canAddClient && (
              <Button
                colorScheme="pink"
                size="sm"
                onClick={() => setModalOpen(true)}
                display="flex"
                alignItems="center"
                gap="6px"
              >
                <LuUserPlus size={13} />
                Add Client
              </Button>
            )}
          </HStack>
        }
      />

      {canAddClient && (
        <AddTraineeModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}

      <Table
        columns={columns}
        rows={filtered}
        getRowKey={(t) => t.id}
        defaultSortKey="name"
        emptyText="No clients match your search."
        onRowClick={(t) => router.push(`/dashboard/trainees/${t.id}`)}
        className="crm-trainee-table"
      />

      <Dialog
        isOpen={!!toDelete}
        onClose={() => !isPending && setToDelete(null)}
        title="Delete client?"
        maxWidth={400}
      >
        <DialogBody>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            <strong style={{ color: "#fff" }}>{toDelete?.name}</strong> will be
            soft-deleted. Their workout history is preserved but they will lose
            access to their client portal immediately.
          </p>
          <HStack justifyContent="flex-end" gap="10px">
            <Button
              variant="ghost"
              colorScheme="neutral"
              size="sm"
              onClick={() => setToDelete(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              colorScheme="red"
              size="sm"
              onClick={confirmDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </HStack>
        </DialogBody>
      </Dialog>
    </>
  );
}
