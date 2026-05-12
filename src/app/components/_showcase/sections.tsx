"use client";

import { Box } from "@chakra-ui/react";
import { useState } from "react";
import { LuGripVertical } from "react-icons/lu";
import { Alert } from "../Alert";
import { Badge } from "../Badge";
import { BottomSheet } from "../BottomSheet";
import { Button } from "../Button";
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../Card";
import { type ChatMessage, ChatPanel } from "../ChatPanel";
import { Checkbox } from "../Checkbox";
import { Dialog, DialogBody } from "../Dialog";
import { Field } from "../Field";
import { IconButton } from "../IconButton";
import { Input } from "../Input";
import { PageHeader } from "../PageHeader";
import { Progress } from "../Progress";
import { ProgressCircle } from "../ProgressCircle";
import { Radio } from "../Radio";
import { Select } from "../Select";
import { Separator } from "../Separator";
import { type SessionEntry, SessionsPanel } from "../SessionsPanel";
import { Skeleton } from "../Skeleton";
import { arrayMove, SortableList } from "../SortableList";
import { Spinner } from "../Spinner";
import { Stat } from "../Stat";
import { StatPill } from "../StatPill";
import { Switch } from "../Switch";
import { Tab, TabGroup } from "../TabGroup";
import { type ColumnDef, Table } from "../Table";
import { Tag } from "../Tag";
import { Text, type TextVariant } from "../Text";
import { Textarea } from "../Textarea";
import { toaster } from "../Toast";
import { SectionTitle, SubSection } from "./ColorPalette";

function Row({ children }: { children: React.ReactNode }) {
  return (
    <Box display="flex" alignItems="center" gap="12px" flexWrap="wrap">
      {children}
    </Box>
  );
}

export function ButtonsSection() {
  return (
    <Box
      as="section"
      id="buttons"
      px="60px"
      py="56px"
      borderBottom="1px solid var(--color-border)"
    >
      <SectionTitle>Buttons</SectionTitle>

      <SubSection title="Color Schemes">
        <Row>
          <Button colorScheme="pink">Pink Primary</Button>
          <Button colorScheme="cyan">Cyan Primary</Button>
        </Row>
      </SubSection>

      <SubSection title="Variants">
        <Row>
          <Button colorScheme="pink" variant="solid">
            Solid
          </Button>
          <Button colorScheme="pink" variant="outline">
            Outline
          </Button>
          <Button colorScheme="pink" variant="ghost">
            Ghost
          </Button>
          <Button colorScheme="pink" variant="link">
            Link
          </Button>
        </Row>
        <Box h="10px" />
        <Row>
          <Button colorScheme="cyan" variant="solid">
            Solid
          </Button>
          <Button colorScheme="cyan" variant="outline">
            Outline
          </Button>
          <Button colorScheme="cyan" variant="ghost">
            Ghost
          </Button>
          <Button colorScheme="cyan" variant="link">
            Link
          </Button>
        </Row>
      </SubSection>

      <SubSection title="Sizes">
        <Row>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
        </Row>
      </SubSection>

      <SubSection title="States">
        <Row>
          <Button loading>Loading</Button>
          <Button loading loadingText="Saving…">
            Save
          </Button>
          <Button disabled>Disabled</Button>
          <Button colorScheme="cyan" variant="outline" disabled>
            Disabled Outline
          </Button>
        </Row>
      </SubSection>

      <SubSection title="Icon Buttons">
        <Row>
          <IconButton aria-label="Add" colorScheme="pink">
            +
          </IconButton>
          <IconButton aria-label="Close" colorScheme="pink" variant="outline">
            ×
          </IconButton>
          <IconButton aria-label="Settings" colorScheme="cyan" variant="ghost">
            ⚙
          </IconButton>
          <IconButton aria-label="Search" colorScheme="cyan" size="lg">
            ⌕
          </IconButton>
        </Row>
      </SubSection>
    </Box>
  );
}

export function FormsSection() {
  const [switchOn, setSwitchOn] = useState(true);
  const [radio, setRadio] = useState("monthly");
  return (
    <Box
      as="section"
      id="forms"
      px="60px"
      py="56px"
      borderBottom="1px solid var(--color-border)"
    >
      <SectionTitle>Form Elements</SectionTitle>

      <Box
        display="grid"
        gridTemplateColumns={{ base: "1fr", lg: "1fr 1fr" }}
        gap="40px"
      >
        <Box display="flex" flexDirection="column" gap="22px">
          <SubSection title="Text Inputs">
            <Box display="flex" flexDirection="column" gap="14px">
              <Field label="Email" helperText="We'll never share your email.">
                <Input placeholder="you@example.com" />
              </Field>
              <Field
                label="Password"
                invalid
                errorText="Must be at least 8 characters"
              >
                <Input type="password" invalid placeholder="••••••••" />
              </Field>
              <Field label="Bio" helperText="Max 280 characters.">
                <Textarea rows={3} placeholder="Tell us about yourself…" />
              </Field>
            </Box>
          </SubSection>

          <SubSection title="Select">
            <Field label="Plan">
              <Select
                placeholder="Choose a plan"
                options={[
                  { value: "free", label: "Free" },
                  { value: "pro", label: "Pro — $12/mo" },
                  { value: "team", label: "Team — $36/mo" },
                ]}
              />
            </Field>
          </SubSection>
        </Box>

        <Box display="flex" flexDirection="column" gap="22px">
          <SubSection title="Checkboxes">
            <Box display="flex" flexDirection="column" gap="10px">
              <Checkbox defaultChecked>Accept terms & conditions</Checkbox>
              <Checkbox colorScheme="cyan">Send me marketing emails</Checkbox>
              <Checkbox disabled>Disabled option</Checkbox>
            </Box>
          </SubSection>

          <SubSection title="Radio Group">
            <Radio
              value={radio}
              onValueChange={setRadio}
              options={[
                { value: "monthly", label: "Monthly — $12" },
                { value: "yearly", label: "Yearly — $120 (save 17%)" },
                { value: "enterprise", label: "Enterprise", disabled: true },
              ]}
            />
          </SubSection>

          <SubSection title="Switch">
            <Box display="flex" flexDirection="column" gap="10px">
              <Switch
                checked={switchOn}
                onCheckedChange={setSwitchOn}
                colorScheme="pink"
              >
                Enable neon glow effects
              </Switch>
              <Switch colorScheme="cyan" defaultChecked>
                Auto-save drafts
              </Switch>
              <Switch disabled>Disabled</Switch>
            </Box>
          </SubSection>
        </Box>
      </Box>
    </Box>
  );
}

export function FeedbackSection() {
  const [progress, setProgress] = useState(62);
  return (
    <Box
      as="section"
      id="feedback"
      px="60px"
      py="56px"
      borderBottom="1px solid var(--color-border)"
    >
      <SectionTitle>Feedback</SectionTitle>

      <SubSection title="Alerts">
        <Box display="flex" flexDirection="column" gap="10px">
          <Alert status="info" title="System update">
            A new version of Neon UI is available.
          </Alert>
          <Alert status="success" title="Saved!">
            Your changes have been synced to the cloud.
          </Alert>
          <Alert status="warning" title="Heads up">
            Your session will expire in 5 minutes.
          </Alert>
          <Alert status="error" title="Something went wrong">
            Could not reach the server. Retrying…
          </Alert>
        </Box>
      </SubSection>

      <SubSection title="Badges">
        <Row>
          <Badge colorScheme="pink" variant="subtle">
            NEW
          </Badge>
          <Badge colorScheme="pink" variant="solid">
            PRO
          </Badge>
          <Badge colorScheme="pink" variant="outline">
            BETA
          </Badge>
          <Badge colorScheme="cyan" variant="subtle">
            v1.0
          </Badge>
          <Badge colorScheme="cyan" variant="solid">
            LIVE
          </Badge>
          <Badge colorScheme="cyan" variant="outline">
            DRAFT
          </Badge>
        </Row>
      </SubSection>

      <SubSection title="Tags">
        <Row>
          <Tag>React</Tag>
          <Tag colorScheme="cyan">TypeScript</Tag>
          <Tag onRemove={() => {}}>removable</Tag>
          <Tag colorScheme="cyan" onRemove={() => {}}>
            design-system
          </Tag>
        </Row>
      </SubSection>

      <SubSection title="Spinners">
        <Row>
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" colorScheme="cyan" />
          <Spinner size="xl" />
        </Row>
      </SubSection>

      <SubSection title="Progress — Linear">
        <Box display="flex" flexDirection="column" gap="18px" maxW="520px">
          <Progress value={progress} label="Uploading" showValueText />
          <Progress value={80} colorScheme="cyan" label="CPU" showValueText />
          <Progress value={null} label="Indeterminate" />
          <Row>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setProgress((p) => Math.max(0, p - 10))}
            >
              −10
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setProgress((p) => Math.min(100, p + 10))}
            >
              +10
            </Button>
          </Row>
        </Box>
      </SubSection>

      <SubSection title="Progress — Circular">
        <Row>
          <ProgressCircle value={25} size="sm" />
          <ProgressCircle value={50} size="md" colorScheme="cyan" />
          <ProgressCircle value={75} size="lg" />
          <ProgressCircle value={100} size="xl" colorScheme="cyan" />
        </Row>
      </SubSection>

      <SubSection title="Skeleton">
        <Box display="flex" flexDirection="column" gap="10px" maxW="380px">
          <Skeleton h="24px" w="60%" />
          <Skeleton h="14px" />
          <Skeleton h="14px" w="85%" />
          <Skeleton h="14px" w="70%" />
        </Box>
      </SubSection>

      <SubSection title="Toasts">
        <Row>
          <Button
            size="sm"
            onClick={() =>
              toaster.create({
                title: "Saved",
                description: "Your work has been saved.",
                type: "success",
              })
            }
          >
            Success toast
          </Button>
          <Button
            size="sm"
            colorScheme="cyan"
            variant="outline"
            onClick={() =>
              toaster.create({
                title: "Heads up",
                description: "Double-check that before you ship.",
                type: "warning",
              })
            }
          >
            Warning toast
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              toaster.create({
                title: "Oh no",
                description: "Something went wrong.",
                type: "error",
              })
            }
          >
            Error toast
          </Button>
        </Row>
      </SubSection>
    </Box>
  );
}

export function CardsSection() {
  return (
    <Box
      as="section"
      id="cards"
      px="60px"
      py="56px"
      borderBottom="1px solid var(--color-border)"
    >
      <SectionTitle>Cards & Layout</SectionTitle>

      <SubSection title="Cards">
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))"
          gap="16px"
        >
          <Card variant="solid">
            <CardHeader>
              <CardTitle>Solid Card</CardTitle>
              <CardDescription>
                Default surface with subtle border.
              </CardDescription>
            </CardHeader>
            <CardBody>
              Use the solid variant for most container surfaces — dialogs,
              settings panels, summary blocks.
            </CardBody>
            <CardFooter>
              <Button size="sm">Action</Button>
              <Button size="sm" variant="ghost">
                Cancel
              </Button>
            </CardFooter>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Outlined Card</CardTitle>
              <CardDescription>Transparent, border-only.</CardDescription>
            </CardHeader>
            <CardBody>
              Stack these inside content rows where you need separation but not
              visual weight.
            </CardBody>
            <CardFooter>
              <Button size="sm" variant="outline" colorScheme="cyan">
                Learn more
              </Button>
            </CardFooter>
          </Card>

          <Card variant="glow" glowColor="cyan">
            <CardHeader>
              <CardTitle>Glow Card</CardTitle>
              <CardDescription>Emphasized with ambient glow.</CardDescription>
            </CardHeader>
            <CardBody>
              For hero content, callouts, or featured plans — use sparingly so
              the glow stays meaningful.
            </CardBody>
            <CardFooter>
              <Button size="sm" colorScheme="cyan">
                Upgrade
              </Button>
            </CardFooter>
          </Card>
        </Box>
      </SubSection>

      <SubSection title="Stats">
        <Card variant="glow">
          <CardBody>
            <Box
              display="grid"
              gridTemplateColumns={{
                base: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              }}
              gap="24px"
            >
              <Stat
                label="Monthly users"
                value="24.8k"
                indicator="up"
                helpText="+12% MoM"
              />
              <Stat
                label="Revenue"
                value="$142k"
                accent="cyan"
                indicator="up"
                helpText="+5% WoW"
              />
              <Stat
                label="Churn"
                value="2.4%"
                indicator="down"
                helpText="−0.3% MoM"
              />
              <Stat label="NPS" value="71" accent="cyan" />
            </Box>
          </CardBody>
        </Card>
      </SubSection>

      <SubSection title="Separators">
        <Box display="flex" flexDirection="column" gap="16px" maxW="520px">
          <Text>Content block one</Text>
          <Separator />
          <Text>Content block two</Text>
          <Separator accent="pink" />
          <Text>Content block three</Text>
          <Separator accent="cyan" />
          <Text>Content block four</Text>
        </Box>
      </SubSection>
    </Box>
  );
}

// ─── Table showcase ──────────────────────────────────────────────────────────

type ShowcaseMember = {
  id: string;
  name: string;
  role: string;
  status: "active" | "away" | "offline";
  sessions: number;
  joined: string;
};

const MEMBERS: ShowcaseMember[] = [
  {
    id: "1",
    name: "Alex Rivers",
    role: "Strength Coach",
    status: "active",
    sessions: 24,
    joined: "Jan 2024",
  },
  {
    id: "2",
    name: "Blair Kim",
    role: "Yoga Instructor",
    status: "active",
    sessions: 18,
    joined: "Mar 2024",
  },
  {
    id: "3",
    name: "Casey Nova",
    role: "HIIT Trainer",
    status: "away",
    sessions: 9,
    joined: "Feb 2024",
  },
  {
    id: "4",
    name: "Drew Lane",
    role: "Mobility Coach",
    status: "offline",
    sessions: 31,
    joined: "Nov 2023",
  },
  {
    id: "5",
    name: "Ember Walsh",
    role: "Strength Coach",
    status: "active",
    sessions: 12,
    joined: "Apr 2024",
  },
];

const STATUS_COLOR: Record<ShowcaseMember["status"], string> = {
  active: "#4ade80",
  away: "#fb923c",
  offline: "#555",
};

const MEMBER_COLS: ColumnDef<ShowcaseMember>[] = [
  {
    key: "name",
    label: "Name",
    render: (row) => (
      <span style={{ color: "#fff", fontWeight: 600 }}>{row.name}</span>
    ),
  },
  { key: "role", label: "Role" },
  {
    key: "sessions",
    label: "Sessions",
    render: (row) => (
      <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12 }}>
        {row.sessions}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (row) => {
      const color = STATUS_COLOR[row.status];
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color,
            textTransform: "capitalize",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: color,
              display: "inline-block",
              boxShadow: `0 0 5px ${color}`,
            }}
          />
          {row.status}
        </span>
      );
    },
  },
  { key: "joined", label: "Joined" },
];

export function TableSection() {
  return (
    <Box
      as="section"
      id="tables"
      px="60px"
      py="56px"
      borderBottom="1px solid var(--color-border)"
    >
      <SectionTitle>Table</SectionTitle>

      <SubSection title="Sortable Data Table">
        <Text
          variant="body-sm"
          display="block"
          color="var(--color-text-muted)"
          mb="20px"
        >
          Click any column header to sort. Click again to reverse. Pass a{" "}
          <Text variant="mono-sm" as="code" color="var(--color-secondary)">
            render
          </Text>{" "}
          function on any column for custom cell content — sorting still uses
          the underlying key value.
        </Text>
        <Table
          columns={MEMBER_COLS}
          rows={MEMBERS}
          getRowKey={(r) => r.id}
          defaultSortKey="name"
        />
      </SubSection>
    </Box>
  );
}

// ─── SessionsPanel showcase ───────────────────────────────────────────────────

const SHOWCASE_SESSIONS: SessionEntry[] = [
  {
    id: "s1",
    occurredAt: new Date("2026-04-22"),
    energyRating: 5,
    painRating: 2,
    comment: "Felt great today, really pushed through the last set.",
    exercises: [
      { id: "e1", name: "Barbell Back Squat", sets: 4, reps: 8, videos: [] },
      { id: "e2", name: "Romanian Deadlift", sets: 3, reps: 10, videos: [] },
      { id: "e3", name: "Plank Hold", sets: 3, reps: 60, videos: [] },
    ],
  },
  {
    id: "s2",
    occurredAt: new Date("2026-04-19"),
    energyRating: 3,
    painRating: 4,
    comment: "Tough session but got through it. Very tired afterwards.",
    exercises: [
      { id: "e4", name: "Dumbbell Row", sets: 4, reps: 10, videos: [] },
      { id: "e5", name: "Box Jump", sets: 4, reps: 6, videos: [] },
    ],
  },
  {
    id: "s3",
    occurredAt: new Date("2026-04-16"),
    energyRating: null,
    painRating: null,
    comment: null,
    exercises: [],
  },
];

export function SessionsPanelSection() {
  return (
    <Box
      as="section"
      id="sessions-panel"
      px="60px"
      py="56px"
      borderBottom="1px solid var(--color-border)"
    >
      <SectionTitle>Sessions Panel</SectionTitle>
      <SubSection title="Accordion session list">
        <Box maxW="520px">
          <SessionsPanel sessions={SHOWCASE_SESSIONS} colorVariant="primary" />
        </Box>
      </SubSection>
    </Box>
  );
}

// ─── ChatPanel showcase ───────────────────────────────────────────────────────

const SHOWCASE_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    content: {
      text: "Hey Jordan, great session yesterday! How are you feeling?",
    },
    createdAt: new Date("2026-04-22T09:14:00"),
    sender: {
      id: "trainer-1",
      name: "Jordan Ellis",
      email: "jordan@example.com",
    },
  },
  {
    id: "m2",
    content: {
      text: "Legs are a bit sore but in a good way! Really felt those RDLs.",
    },
    createdAt: new Date("2026-04-22T09:31:00"),
    sender: {
      id: "client-1",
      name: "Marcus Webb",
      email: "marcus@example.com",
    },
  },
  {
    id: "m3",
    content: {
      text: "That's the sweet spot. Aim for 150g protein today — I've added a recovery video to your library.",
    },
    createdAt: new Date("2026-04-22T09:33:00"),
    sender: {
      id: "trainer-1",
      name: "Jordan Ellis",
      email: "jordan@example.com",
    },
  },
];

function ShowcaseChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(SHOWCASE_MESSAGES);

  async function handleSend(text: string): Promise<ChatMessage> {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      content: { text },
      createdAt: new Date(),
      sender: {
        id: "trainer-1",
        name: "Jordan Ellis",
        email: "jordan@example.com",
      },
    };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }

  return (
    <ChatPanel
      initialMessages={messages}
      currentUserId="trainer-1"
      participant={{
        id: "client-1",
        name: "Marcus Webb",
        email: "marcus@example.com",
      }}
      onSend={handleSend}
    />
  );
}

export function ChatPanelSection() {
  return (
    <Box
      as="section"
      id="chat-panel"
      px="60px"
      py="56px"
      borderBottom="1px solid var(--color-border)"
    >
      <SectionTitle>Chat Panel</SectionTitle>
      <SubSection title="Message thread with live input">
        <Text
          variant="body-sm"
          display="block"
          color="var(--color-text-muted)"
          mb="20px"
        >
          Pass{" "}
          <Text variant="mono-sm" as="code" color="var(--color-secondary)">
            onSend
          </Text>{" "}
          as an async function that persists the message and returns the saved{" "}
          <Text variant="mono-sm" as="code" color="var(--color-secondary)">
            ChatMessage
          </Text>
          . Messages from{" "}
          <Text variant="mono-sm" as="code" color="var(--color-secondary)">
            currentUserId
          </Text>{" "}
          appear on the left; others on the right.
        </Text>
        <Box maxW="520px">
          <ShowcaseChatPanel />
        </Box>
      </SubSection>
    </Box>
  );
}

// ─── Dialog showcase ──────────────────────────────────────────────────────────

function ShowcaseDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Example Dialog"
        maxWidth={480}
      >
        <DialogBody>
          <Box display="flex" flexDirection="column" gap="16px">
            <Box
              fontSize="14px"
              color="var(--color-text-muted)"
              lineHeight="1.6"
            >
              This is a reusable dialog shell. Drop any content inside — forms,
              confirmations, detail panels. Esc or clicking the backdrop closes
              it.
            </Box>
            <Box display="flex" gap="10px" justifyContent="flex-end">
              <Button
                variant="ghost"
                colorScheme="pink"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Confirm</Button>
            </Box>
          </Box>
        </DialogBody>
      </Dialog>
    </>
  );
}

export function PageHeaderSection() {
  return (
    <Box
      as="section"
      id="page-header"
      px="60px"
      py="56px"
      borderBottom="1px solid var(--color-border)"
    >
      <SectionTitle>Page Header</SectionTitle>
      <SubSection title="Title only">
        <PageHeader title="Dashboard" />
      </SubSection>
      <SubSection title="Title + subtitle">
        <PageHeader
          title="Clients"
          subtitle="24 total · click any row to view profile"
        />
      </SubSection>
      <SubSection title="Title + subtitle + action">
        <PageHeader
          title="Videos"
          subtitle="12 clips ready"
          action={
            <Button variant="outline" colorScheme="cyan" size="sm">
              Upload Video
            </Button>
          }
        />
      </SubSection>
    </Box>
  );
}

export function DialogSection() {
  return (
    <Box
      as="section"
      id="dialog"
      px="60px"
      py="56px"
      borderBottom="1px solid var(--color-border)"
    >
      <SectionTitle>Dialog</SectionTitle>
      <SubSection title="Modal overlay">
        <Text
          variant="body-sm"
          display="block"
          color="var(--color-text-muted)"
          mb="20px"
        >
          Generic modal shell. Pass{" "}
          <Text variant="mono-sm" as="code" color="var(--color-secondary)">
            title
          </Text>{" "}
          for the built-in header row, or omit it and render your own header
          inside{" "}
          <Text variant="mono-sm" as="code" color="var(--color-secondary)">
            children
          </Text>
          . Backdrop click and Esc both close.
        </Text>
        <ShowcaseDialog />
      </SubSection>
    </Box>
  );
}

// ─── TabGroup showcase ────────────────────────────────────────────────────────

function ShowcaseTabGroup() {
  const [tab, setTab] = useState("plans");
  return (
    <Box display="flex" flexDirection="column" gap="24px" maxW="420px">
      <Box>
        <Text
          variant="body-xs"
          color="var(--color-text-dim)"
          mb="10px"
          display="block"
        >
          Pink (default — client portal)
        </Text>
        <TabGroup colorScheme="pink">
          <Tab
            active={tab === "plans"}
            colorScheme="pink"
            onClick={() => setTab("plans")}
          >
            My Plans
          </Tab>
          <Tab
            active={tab === "history"}
            colorScheme="pink"
            onClick={() => setTab("history")}
          >
            History (3)
          </Tab>
          <Tab
            active={tab === "chat"}
            colorScheme="pink"
            onClick={() => setTab("chat")}
          >
            Chat
          </Tab>
        </TabGroup>
      </Box>
      <Box>
        <Text
          variant="body-xs"
          color="var(--color-text-dim)"
          mb="10px"
          display="block"
        >
          Cyan (dashboard modals)
        </Text>
        <TabGroup colorScheme="cyan">
          <Tab
            active={tab === "plans"}
            colorScheme="cyan"
            onClick={() => setTab("plans")}
          >
            Library
          </Tab>
          <Tab
            active={tab === "history"}
            colorScheme="cyan"
            onClick={() => setTab("history")}
          >
            Upload new
          </Tab>
        </TabGroup>
      </Box>
    </Box>
  );
}

export function TabGroupSection() {
  return (
    <Box
      as="section"
      id="tab-group"
      px="60px"
      py="56px"
      borderBottom="1px solid var(--color-border)"
    >
      <SectionTitle>Tab Group</SectionTitle>
      <SubSection title="Segmented tab navigation">
        <Text
          variant="body-sm"
          display="block"
          color="var(--color-text-muted)"
          mb="20px"
        >
          Use{" "}
          <Text variant="mono-sm" as="code" color="var(--color-secondary)">
            TabGroup
          </Text>{" "}
          as the container and{" "}
          <Text variant="mono-sm" as="code" color="var(--color-secondary)">
            Tab
          </Text>{" "}
          for each option. Control the{" "}
          <Text variant="mono-sm" as="code" color="var(--color-secondary)">
            active
          </Text>{" "}
          state externally — typically with{" "}
          <Text variant="mono-sm" as="code" color="var(--color-secondary)">
            useState
          </Text>{" "}
          or a URL search param.
        </Text>
        <ShowcaseTabGroup />
      </SubSection>
    </Box>
  );
}

// ─── BottomSheet showcase ─────────────────────────────────────────────────────

function ShowcaseBottomSheet() {
  const [which, setWhich] = useState<null | "basic" | "footer" | "list">(null);
  const plans = ["Lower Body Power", "Upper Push Day", "Full Body HIIT"];
  return (
    <Box display="flex" gap="12px" flexWrap="wrap">
      <Button onClick={() => setWhich("basic")}>
        Basic (title + subtitle)
      </Button>
      <Button
        colorScheme="cyan"
        variant="outline"
        onClick={() => setWhich("footer")}
      >
        With footer
      </Button>
      <Button
        colorScheme="pink"
        variant="ghost"
        onClick={() => setWhich("list")}
      >
        List content
      </Button>

      {which === "basic" && (
        <BottomSheet
          onClose={() => setWhich(null)}
          title="Session Complete 🎉"
          subtitle="Duration: 42:15 · How did it go?"
        >
          <Box p="20px">
            <Textarea
              colorScheme="cyan"
              placeholder="How did it feel?"
              rows={3}
              w="100%"
            />
          </Box>
        </BottomSheet>
      )}

      {which === "footer" && (
        <BottomSheet
          onClose={() => setWhich(null)}
          title="Add Notes"
          subtitle="Optional — jot down how the session felt"
          footer={
            <Box display="flex" gap="10px">
              <Button
                variant="ghost"
                colorScheme="neutral"
                style={{ flex: 1 }}
                onClick={() => setWhich(null)}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                colorScheme="cyan"
                style={{ flex: 2 }}
                onClick={() => setWhich(null)}
              >
                Save
              </Button>
            </Box>
          }
        >
          <Box p="20px">
            <Textarea
              colorScheme="cyan"
              placeholder="Write your notes…"
              rows={4}
              w="100%"
            />
          </Box>
        </BottomSheet>
      )}

      {which === "list" && (
        <BottomSheet
          onClose={() => setWhich(null)}
          title="Choose a Workout Plan"
        >
          {plans.map((p) => (
            <Box
              key={p}
              px="20px"
              py="14px"
              display="flex"
              alignItems="center"
              gap="12px"
              borderBottom="1px solid var(--color-border)"
              cursor="pointer"
              _hover={{ bg: "rgba(255,255,255,0.04)" }}
              onClick={() => setWhich(null)}
            >
              <Box
                w="8px"
                h="8px"
                borderRadius="50%"
                bg="var(--color-primary)"
                boxShadow="0 0 6px var(--color-primary)"
                flexShrink={0}
              />
              <Box flex={1} fontSize="14px" fontWeight={600} color="#fff">
                {p}
              </Box>
            </Box>
          ))}
          <Box h="16px" />
        </BottomSheet>
      )}
    </Box>
  );
}

export function BottomSheetSection() {
  return (
    <Box
      as="section"
      id="bottom-sheet"
      px="60px"
      py="56px"
      borderBottom="1px solid var(--color-border)"
    >
      <SectionTitle>Bottom Sheet</SectionTitle>
      <SubSection title="Slide-up overlay panel">
        <Text
          variant="body-sm"
          display="block"
          color="var(--color-text-muted)"
          mb="20px"
        >
          Mobile-first sheet that slides up from the bottom. Backdrop click and
          Esc close it. Accepts optional{" "}
          <Text variant="mono-sm" as="code" color="var(--color-secondary)">
            title
          </Text>
          ,{" "}
          <Text variant="mono-sm" as="code" color="var(--color-secondary)">
            subtitle
          </Text>
          ,{" "}
          <Text variant="mono-sm" as="code" color="var(--color-secondary)">
            titleAction
          </Text>
          , and{" "}
          <Text variant="mono-sm" as="code" color="var(--color-secondary)">
            footer
          </Text>{" "}
          slots. Renders via portal.
        </Text>
        <ShowcaseBottomSheet />
      </SubSection>
    </Box>
  );
}

// ─── SortableList showcase ────────────────────────────────────────────────────

type ShowcaseSortItem = { id: string; label: string };

const SHOWCASE_SORT_ITEMS: ShowcaseSortItem[] = [
  { id: "1", label: "Barbell Back Squat" },
  { id: "2", label: "Bench Press" },
  { id: "3", label: "Deadlift" },
  { id: "4", label: "Pull-Ups" },
  { id: "5", label: "Plank Hold" },
];

function ShowcaseSortableList() {
  const [items, setItems] = useState<ShowcaseSortItem[]>(SHOWCASE_SORT_ITEMS);
  return (
    <Box maxW="420px">
      <SortableList
        items={items}
        getItemId={(i) => i.id}
        onReorder={(from, to) => setItems((prev) => arrayMove(prev, from, to))}
        renderItem={(item, idx, drag) => (
          <Box
            display="flex"
            alignItems="center"
            gap="10px"
            px="14px"
            py="10px"
            mb="8px"
            bg="var(--color-surface)"
            border="1px solid var(--color-border)"
            borderRadius="8px"
            color="#fff"
          >
            <button
              type="button"
              {...drag.attributes}
              {...drag.listeners}
              ref={drag.setActivatorRef}
              aria-label={`Drag ${item.label}`}
              style={{
                cursor: drag.isDragging ? "grabbing" : "grab",
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.5)",
                display: "flex",
                alignItems: "center",
                padding: 4,
              }}
            >
              <LuGripVertical size={16} />
            </button>
            <span style={{ flex: 1, fontWeight: 500, fontSize: 14 }}>
              {idx + 1}. {item.label}
            </span>
          </Box>
        )}
      />
    </Box>
  );
}

export function SortableListSection() {
  return (
    <Box
      as="section"
      id="sortable-list"
      px="60px"
      py="56px"
      borderBottom="1px solid var(--color-border)"
    >
      <SectionTitle>Sortable List</SectionTitle>
      <SubSection title="Drag-and-drop list with keyboard support">
        <Text
          variant="body-sm"
          display="block"
          color="var(--color-text-muted)"
          mb="20px"
        >
          Render-prop primitive over{" "}
          <Text variant="mono-sm" as="code" color="var(--color-secondary)">
            @dnd-kit/sortable
          </Text>
          . Consumers supply{" "}
          <Text variant="mono-sm" as="code" color="var(--color-secondary)">
            renderItem
          </Text>{" "}
          and spread the provided drag props on whatever they want to act as the
          handle. Keyboard: focus the handle, press Space to pick up, arrow keys
          to move, Space to drop, Esc to cancel.
        </Text>
        <ShowcaseSortableList />
      </SubSection>
    </Box>
  );
}

// ─── StatPill showcase ────────────────────────────────────────────────────────

export function StatPillSection() {
  return (
    <Box
      as="section"
      id="stat-pill"
      px="60px"
      py="56px"
      borderBottom="1px solid var(--color-border)"
    >
      <SectionTitle>Stat Pill</SectionTitle>
      <SubSection title="Metric display cards">
        <Text
          variant="body-sm"
          display="block"
          color="var(--color-text-muted)"
          mb="20px"
        >
          Compact card for displaying a labelled numeric metric with an optional
          unit. Defaults to{" "}
          <Text variant="mono-sm" as="code" color="var(--color-secondary)">
            colorScheme="cyan"
          </Text>
          .
        </Text>
        <Box display="flex" flexDirection="column" gap="24px">
          <Box>
            <Text
              variant="body-xs"
              color="var(--color-text-dim)"
              mb="10px"
              display="block"
            >
              Reps-based exercise
            </Text>
            <Box
              display="grid"
              gridTemplateColumns="repeat(3, 120px)"
              gap="8px"
            >
              <StatPill label="Sets" value={4} />
              <StatPill label="Reps" value={10} unit="per set" />
              <StatPill label="Volume" value={40} unit="total reps" />
            </Box>
          </Box>
          <Box>
            <Text
              variant="body-xs"
              color="var(--color-text-dim)"
              mb="10px"
              display="block"
            >
              Duration-based exercise
            </Text>
            <Box
              display="grid"
              gridTemplateColumns="repeat(3, 120px)"
              gap="8px"
            >
              <StatPill label="Sets" value={3} />
              <StatPill label="Duration" value={45} unit="sec / set" />
              <StatPill
                label="Total"
                value={135}
                unit="seconds"
                colorScheme="pink"
              />
            </Box>
          </Box>
        </Box>
      </SubSection>
    </Box>
  );
}

// ─── Text showcase ────────────────────────────────────────────────────────────

const DISPLAY_VARIANTS: TextVariant[] = [
  "display-7xl",
  "display-6xl",
  "display-5xl",
  "display-4xl",
  "display-3xl",
  "display-2xl",
  "display-xl",
];

const BODY_VARIANTS: TextVariant[] = [
  "body-lg",
  "body-md",
  "body-sm",
  "body-xs",
  "body-3xs",
  "label",
];

const MONO_VARIANTS: TextVariant[] = ["mono-lg", "mono-md", "mono-sm"];

function VariantRow({ variant }: { variant: TextVariant }) {
  const sample = variant.startsWith("display")
    ? "The quick neon fox"
    : variant.startsWith("mono")
      ? 'const color = "#FD6DBB";'
      : "The quick brown fox jumps over the lazy dog.";
  return (
    <Box
      display="flex"
      alignItems="baseline"
      gap="16px"
      py="10px"
      borderBottom="1px solid var(--color-border)"
    >
      <Text
        variant="mono-sm"
        color="var(--color-text-dim)"
        w="120px"
        flexShrink={0}
      >
        {variant}
      </Text>
      <Text variant={variant} color="var(--color-text)" textWrap="pretty">
        {sample}
      </Text>
    </Box>
  );
}

export function TextSection() {
  return (
    <Box
      as="section"
      id="text"
      px="60px"
      py="56px"
      borderBottom="1px solid var(--color-border)"
    >
      <SectionTitle>Text</SectionTitle>
      <Text
        variant="body-sm"
        display="block"
        color="var(--color-text-muted)"
        mb="28px"
      >
        Use{" "}
        <Text variant="mono-sm" as="code" color="var(--color-secondary)">
          variant
        </Text>{" "}
        to select a type style. All Chakra style props pass through — override{" "}
        <Text variant="mono-sm" as="code" color="var(--color-secondary)">
          color
        </Text>
        ,{" "}
        <Text variant="mono-sm" as="code" color="var(--color-secondary)">
          as
        </Text>
        , or any other prop as needed.
      </Text>
      <SubSection title="Display — Syne">
        {DISPLAY_VARIANTS.map((v) => (
          <VariantRow key={v} variant={v} />
        ))}
      </SubSection>
      <SubSection title="Body — Space Grotesk">
        {BODY_VARIANTS.map((v) => (
          <VariantRow key={v} variant={v} />
        ))}
      </SubSection>
      <SubSection title="Mono — Space Mono">
        {MONO_VARIANTS.map((v) => (
          <VariantRow key={v} variant={v} />
        ))}
      </SubSection>
    </Box>
  );
}
