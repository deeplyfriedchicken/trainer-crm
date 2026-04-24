"use client";

import { Box } from "@chakra-ui/react";
import { useState } from "react";
import { Alert } from "../Alert";
import { Badge } from "../Badge";
import { Button } from "../Button";
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../Card";
import { Checkbox } from "../Checkbox";
import { Field } from "../Field";
import { IconButton } from "../IconButton";
import { Input } from "../Input";
import { Progress } from "../Progress";
import { ProgressCircle } from "../ProgressCircle";
import { Radio } from "../Radio";
import { Select } from "../Select";
import { Separator } from "../Separator";
import { Skeleton } from "../Skeleton";
import { Spinner } from "../Spinner";
import { Stat } from "../Stat";
import { Switch } from "../Switch";
import { Tag } from "../Tag";
import { Textarea } from "../Textarea";
import { toaster } from "../Toast";
import { type ColumnDef, Table } from "../Table";
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
      borderBottom="1px solid var(--neon-border)"
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
      borderBottom="1px solid var(--neon-border)"
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
      borderBottom="1px solid var(--neon-border)"
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
      borderBottom="1px solid var(--neon-border)"
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
          <Box>Content block one</Box>
          <Separator />
          <Box>Content block two</Box>
          <Separator accent="pink" />
          <Box>Content block three</Box>
          <Separator accent="cyan" />
          <Box>Content block four</Box>
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
      <span
        style={{ fontFamily: "var(--font-neon-mono), monospace", fontSize: 12 }}
      >
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
      borderBottom="1px solid var(--neon-border)"
    >
      <SectionTitle>Table</SectionTitle>

      <SubSection title="Sortable Data Table">
        <Box color="var(--neon-text-muted)" fontSize="13px" mb="20px">
          Click any column header to sort. Click again to reverse. Pass a{" "}
          <Box
            as="code"
            fontFamily="var(--font-neon-mono), monospace"
            color="var(--neon-cyan)"
            fontSize="12px"
          >
            render
          </Box>{" "}
          function on any column for custom cell content — sorting still uses
          the underlying key value.
        </Box>
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
