import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Table, type ColumnDef } from "./Table";
import { Badge } from "./Badge";

const meta: Meta = {
  title: "Components/Table",
  parameters: { layout: "padded" },
};

export default meta;

type Trainee = {
  id: string;
  name: string;
  email: string;
  sessions: number;
  status: "active" | "inactive";
};

const trainees: Trainee[] = [
  { id: "1", name: "Alex Johnson", email: "alex@example.com", sessions: 24, status: "active" },
  { id: "2", name: "Maria Garcia", email: "maria@example.com", sessions: 8, status: "active" },
  { id: "3", name: "Sam Lee", email: "sam@example.com", sessions: 0, status: "inactive" },
  { id: "4", name: "Jordan Park", email: "jordan@example.com", sessions: 15, status: "active" },
  { id: "5", name: "Taylor Swift", email: "taylor@example.com", sessions: 3, status: "inactive" },
];

const columns: ColumnDef<Trainee>[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "sessions", label: "Sessions" },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <Badge
        colorScheme={row.status === "active" ? "cyan" : "pink"}
        variant={row.status === "active" ? "subtle" : "outline"}
      >
        {row.status}
      </Badge>
    ),
  },
];

export const Default: StoryObj = {
  render: () => (
    <Table
      columns={columns}
      rows={trainees}
      getRowKey={(r) => r.id}
      defaultSortKey="name"
    />
  ),
};

export const Clickable: StoryObj = {
  render: () => (
    <Table
      columns={columns}
      rows={trainees}
      getRowKey={(r) => r.id}
      defaultSortKey="sessions"
      onRowClick={(r) => alert(`Clicked: ${r.name}`)}
    />
  ),
};

export const Empty: StoryObj = {
  render: () => (
    <Table
      columns={columns}
      rows={[]}
      getRowKey={(r) => r.id}
      emptyText="No trainees found."
    />
  ),
};
