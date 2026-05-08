<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# PNPM
Use pnpm


# Database schema

PostgreSQL via Drizzle ORM. Schema lives at `src/db/schema.ts`; migrations in `drizzle/`. Every table uses cuid2 `text` ids and `created_at`/`updated_at` timestamptz where noted. Tables that record audit attribution (`workout_plans`, `exercises`, `workout_plan_videos`, `exercise_videos`, `workouts`, `workout_exercises`, `workout_videos`) also carry `created_by` / `updated_by` via a shared `authorship` block: both NOT NULL, FK → `users.id` ON DELETE RESTRICT.

## Enums

- `user_role`: `admin` | `trainer_manager` | `trainer` | `trainee`
- `video_status`: `uploading` | `processing` | `ready` | `failed`
- `exercise_type`: `reps` | `duration`

## `users`
| column          | type        | notes                                        |
|-----------------|-------------|----------------------------------------------|
| id              | text PK     | cuid2                                        |
| email           | text        | NOT NULL, unique (`users_email_idx`)         |
| name            | text        | NOT NULL                                     |
| pin             | text        | nullable; client-portal PIN                  |
| pin_updated_at  | timestamptz | nullable                                     |
| deleted_at      | timestamptz | nullable; soft-delete marker                 |
| created_at      | timestamptz | default now()                                |
| updated_at      | timestamptz | default now(), auto-updates                  |

## `user_roles`
Composite PK `(user_id, role)` — a user may hold multiple roles.

| column       | type        | notes                                            |
|--------------|-------------|--------------------------------------------------|
| user_id      | text        | FK → `users.id` ON DELETE CASCADE                |
| role         | user_role   | NOT NULL                                         |
| assigned_at  | timestamptz | default now()                                    |

Indexes: `user_roles_role_idx` on `role`.

## `videos`
S3-backed, processed via AWS MediaConvert. A video may optionally be linked directly to a trainee via `trainee_id`; it is also attached to plans, exercises, or logged workouts via the join tables `workout_plan_videos`, `exercise_videos`, and `workout_videos`.

| column             | type          | notes                                              |
|--------------------|---------------|----------------------------------------------------|
| id                 | text PK       | cuid2                                              |
| uploader_id        | text          | FK → `users.id` ON DELETE RESTRICT                 |
| trainee_id         | text          | nullable; FK → `users.id` ON DELETE SET NULL       |
| title              | text          | NOT NULL                                           |
| description        | text          | nullable                                           |
| file_key           | text          | NOT NULL, unique (`videos_file_key_idx`)           |
| file_url           | text          | NOT NULL                                           |
| file_name          | text          | NOT NULL                                           |
| file_size_bytes    | bigint        | NOT NULL (mapped as `number`)                      |
| mime_type          | text          | NOT NULL                                           |
| duration_seconds   | integer       | nullable                                           |
| status             | video_status  | NOT NULL, default `uploading`                      |
| original_file_key  | text          | nullable; pre-transcode key                        |
| deleted_at         | timestamptz   | nullable; soft-delete marker                       |
| created_at         | timestamptz   | default now()                                      |
| updated_at         | timestamptz   | default now(), auto-updates                        |

Indexes: `videos_uploader_idx` on `uploader_id`, unique `videos_file_key_idx` on `file_key`.

## `workout_plans`
A plan assigned to a trainee — the prescribed workout. Has many `exercises`. Logged workouts reference this via `workouts.workout_plan_id`.

| column          | type        | notes                                          |
|-----------------|-------------|------------------------------------------------|
| id              | text PK     | cuid2                                          |
| trainee_id      | text        | FK → `users.id` ON DELETE CASCADE              |
| name            | text        | NOT NULL, default `''`                         |
| occurred_at     | timestamptz | NOT NULL                                       |
| comment         | text        | nullable                                       |
| created_at      | timestamptz | default now()                                  |
| updated_at      | timestamptz | default now(), auto-updates                    |
| created_by      | text        | FK → `users.id` ON DELETE RESTRICT, NOT NULL   |
| updated_by      | text        | FK → `users.id` ON DELETE RESTRICT, NOT NULL   |

Indexes: `workout_plans_trainee_idx`, `workout_plans_occurred_at_idx`, `workout_plans_created_by_idx`.

## `exercises`
Child of `workout_plans` — a plan has many exercises. Deleting a plan cascades to its exercises. The `type` field discriminates between `reps`-based and `duration`-based exercises; a CHECK constraint enforces that the matching column is set.

| column            | type          | notes                                                       |
|-------------------|---------------|-------------------------------------------------------------|
| id                | text PK       | cuid2                                                       |
| workout_plan_id   | text          | FK → `workout_plans.id` ON DELETE CASCADE                   |
| name              | text          | NOT NULL                                                    |
| type              | exercise_type | NOT NULL, default `reps`                                    |
| sets              | integer       | NOT NULL                                                    |
| reps              | integer       | nullable; required when `type='reps'` (CHECK)               |
| duration_seconds  | integer       | nullable; required when `type='duration'` (CHECK)           |
| weight_lbs        | real          | nullable                                                    |
| comment           | text          | nullable                                                    |
| created_at        | timestamptz   | default now()                                               |
| updated_at        | timestamptz   | default now(), auto-updates                                 |
| created_by        | text          | FK → `users.id` ON DELETE RESTRICT, NOT NULL                |
| updated_by        | text          | FK → `users.id` ON DELETE RESTRICT, NOT NULL                |

Indexes: `exercises_plan_idx`, `exercises_created_by_idx`.
Check constraint: `exercises_type_fields_check` — `(type='reps' AND reps IS NOT NULL) OR (type='duration' AND duration_seconds IS NOT NULL)`.

## `workout_plan_videos`
Join table linking a plan to one or more rows in `videos` — for videos attached to the plan as a whole rather than a specific exercise. Both sides cascade on delete.

| column            | type        | notes                                                |
|-------------------|-------------|------------------------------------------------------|
| workout_plan_id   | text        | FK → `workout_plans.id` ON DELETE CASCADE            |
| video_id          | text        | FK → `videos.id` ON DELETE CASCADE                   |
| created_at        | timestamptz | default now()                                        |
| updated_at        | timestamptz | default now(), auto-updates                          |
| created_by        | text        | FK → `users.id` ON DELETE RESTRICT, NOT NULL         |
| updated_by        | text        | FK → `users.id` ON DELETE RESTRICT, NOT NULL         |

Primary key: composite `(workout_plan_id, video_id)`.
Indexes: `workout_plan_videos_video_idx` on `video_id`, `workout_plan_videos_created_by_idx` on `created_by`.

## `exercise_videos`
Join table linking an exercise to one or more rows in `videos`. Both sides cascade on delete.

| column      | type        | notes                                                |
|-------------|-------------|------------------------------------------------------|
| exercise_id | text        | FK → `exercises.id` ON DELETE CASCADE                |
| video_id    | text        | FK → `videos.id` ON DELETE CASCADE                   |
| created_at  | timestamptz | default now()                                        |
| updated_at  | timestamptz | default now(), auto-updates                          |
| created_by  | text        | FK → `users.id` ON DELETE RESTRICT, NOT NULL         |
| updated_by  | text        | FK → `users.id` ON DELETE RESTRICT, NOT NULL         |

Primary key: composite `(exercise_id, video_id)`.
Indexes: `exercise_videos_video_idx` on `video_id`, `exercise_videos_created_by_idx` on `created_by`.

## `workouts`
A logged workout session — what the trainee actually did. May reference the `workout_plan` it was performed against (nullable; `ON DELETE SET NULL` so workout history survives plan deletion). Pain and energy ratings are 1–10 self-reports, nullable.

| column           | type        | notes                                                |
|------------------|-------------|------------------------------------------------------|
| id               | text PK     | cuid2                                                |
| trainee_id       | text        | FK → `users.id` ON DELETE CASCADE                    |
| workout_plan_id  | text        | nullable; FK → `workout_plans.id` ON DELETE SET NULL |
| duration_seconds | integer     | NOT NULL                                             |
| pain_rating      | integer     | nullable; CHECK `IS NULL OR BETWEEN 1 AND 10`        |
| energy_rating    | integer     | nullable; CHECK `IS NULL OR BETWEEN 1 AND 10`        |
| comment          | text        | nullable                                             |
| created_at       | timestamptz | default now()                                        |
| updated_at       | timestamptz | default now(), auto-updates                          |
| created_by       | text        | FK → `users.id` ON DELETE RESTRICT, NOT NULL         |
| updated_by       | text        | FK → `users.id` ON DELETE RESTRICT, NOT NULL         |

Indexes: `workouts_trainee_idx`, `workouts_plan_idx`, `workouts_created_at_idx`.
Check constraints: `workouts_energy_rating_range`, `workouts_pain_rating_range`.

## `workout_exercises`
Join table linking a logged `workout` to the `exercises` performed during it. Per-set data is stored as JSONB on `sets_data` so the schema is extensible without migrations. Both sides cascade on delete.

| column       | type        | notes                                                 |
|--------------|-------------|-------------------------------------------------------|
| workout_id   | text        | FK → `workouts.id` ON DELETE CASCADE                  |
| exercise_id  | text        | FK → `exercises.id` ON DELETE CASCADE                 |
| sets_data    | jsonb       | nullable; typed `WorkoutSetLog[]` (see below)         |
| created_at   | timestamptz | default now()                                         |
| updated_at   | timestamptz | default now(), auto-updates                           |
| created_by   | text        | FK → `users.id` ON DELETE RESTRICT, NOT NULL          |
| updated_by   | text        | FK → `users.id` ON DELETE RESTRICT, NOT NULL          |

Primary key: composite `(workout_id, exercise_id)`.
Indexes: `workout_exercises_exercise_idx`, `workout_exercises_created_by_idx`.

TypeScript type: `WorkoutSetLog = { reps?: number; durationSeconds?: number; weightLbs?: number; completed: boolean }` — exported from `src/db/schema.ts`.

## `workout_videos`
Join table linking a logged `workout` to one or more rows in `videos`. Both sides cascade on delete.

| column      | type        | notes                                                |
|-------------|-------------|------------------------------------------------------|
| workout_id  | text        | FK → `workouts.id` ON DELETE CASCADE                 |
| video_id    | text        | FK → `videos.id` ON DELETE CASCADE                   |
| created_at  | timestamptz | default now()                                        |
| updated_at  | timestamptz | default now(), auto-updates                          |
| created_by  | text        | FK → `users.id` ON DELETE RESTRICT, NOT NULL         |
| updated_by  | text        | FK → `users.id` ON DELETE RESTRICT, NOT NULL         |

Primary key: composite `(workout_id, video_id)`.
Indexes: `workout_videos_video_idx` on `video_id`, `workout_videos_created_by_idx` on `created_by`.

## `chats`
One chat thread per trainee — shared across all trainers. Any trainer who messages the trainee writes into this single thread, and the trainee sees every message. Created on first message send via `getOrCreateChat`.

| column      | type        | notes                                         |
|-------------|-------------|-----------------------------------------------|
| id          | text PK     | cuid2                                         |
| trainee_id  | text        | FK → `users.id` ON DELETE CASCADE             |
| created_at  | timestamptz | default now()                                 |
| updated_at  | timestamptz | default now(), auto-updates                   |

Indexes: `chats_trainee_idx` (unique).

## `messages`
Individual messages within a chat. Content is stored as **JSONB** (`{ text: string }`) so the schema is extensible for future attachments, reactions, etc. without migrations.

| column     | type        | notes                                                          |
|------------|-------------|----------------------------------------------------------------|
| id         | text PK     | cuid2                                                          |
| chat_id    | text        | FK → `chats.id` ON DELETE CASCADE                             |
| sender_id  | text        | FK → `users.id` ON DELETE RESTRICT                            |
| content    | jsonb       | NOT NULL · typed as `MessageContent = { text: string }`       |
| created_at | timestamptz | default now()                                                  |

Indexes: `messages_chat_idx` on `chat_id`, `messages_sender_idx` on `sender_id`.

TypeScript type: `MessageContent` is exported from `src/db/schema.ts`. Extend it there when adding new content fields.

## `tags`
Flat tag vocabulary. Tags are created on-the-fly and linked to videos via `video_tags`.

| column     | type        | notes                                |
|------------|-------------|--------------------------------------|
| id         | text PK     | cuid2                                |
| name       | text        | NOT NULL, unique (`tags_name_idx`)   |
| created_at | timestamptz | default now()                        |

## `video_tags`
Join table linking videos to tags. Both sides cascade on delete.

| column     | type        | notes                                   |
|------------|-------------|-----------------------------------------|
| video_id   | text        | FK → `videos.id` ON DELETE CASCADE      |
| tag_id     | text        | FK → `tags.id` ON DELETE CASCADE        |
| created_at | timestamptz | default now()                           |

Primary key: composite `(video_id, tag_id)`.
Indexes: `video_tags_tag_idx` on `tag_id`.

## Relations (Drizzle)

- `users` → many `user_roles`; many `videos` as uploader and as direct trainee (relation names `videos_uploader` / `videos_trainee`); many `workout_plans` as trainee (`workout_plans_trainee`); many `workouts` as trainee (`workouts_trainee`).
- `videos` → one uploader, one optional trainee (both `users`); many `exercise_videos`; many `workout_plan_videos`; many `workout_videos`; many `video_tags`.
- `workout_plans` → one trainee, one creator, one updater (`workout_plans_trainee` / `workout_plans_creator` / `workout_plans_updater`); many `exercises`; many `workout_plan_videos`; many `workouts`.
- `exercises` → one parent `workout_plan`; one creator, one updater (`exercises_creator` / `exercises_updater`); many `exercise_videos`; many `workout_exercises`.
- `workouts` → one trainee, one optional `workout_plan`, one creator, one updater (`workouts_trainee` / `workouts_creator` / `workouts_updater`); many `workout_exercises`; many `workout_videos`.
- `workout_plan_videos` → one `workout_plan`, one `video`.
- `exercise_videos` → one `exercise`, one `video`.
- `workout_exercises` → one `workout`, one `exercise`.
- `workout_videos` → one `workout`, one `video`.
- `chats` → one trainee (`chats_trainee`); many `messages`. Senders of those messages can be any user (trainee or any trainer).
- `messages` → one `chat`, one sender (`messages_sender`).
- `tags` → many `video_tags`.
- `video_tags` → one `video`, one `tag`.

# Component system

## Chakra UI + component library — use these first

**Always reach for Chakra primitives and the shared component library before writing plain HTML or inline styles.**

- **Layout:** Use Chakra's `Box`, `Flex`, `HStack`, `VStack`, `SimpleGrid`, `Grid`, `Stack` instead of plain `<div>` with inline `display`/`gap`/`align` styles.
- **Typography:** Use `Box as="h1/h2/p/span"` with Chakra style props, or the existing library components — not bare `<h1>` / `<p>` tags with CSS classes.
- **Actions:** Always use the library `Button` or `IconButton` instead of raw `<button>` elements.
- **Forms:** Use the library `Input`, `Textarea`, `Select`, `Field`, `Checkbox`, `Radio`, `Switch` for all form elements.
- **Feedback:** Use `Alert`, `Spinner`, `Skeleton`, `Progress`, `Toast` from the library.
- **Cards / surfaces:** Use the library `Card` (variants: `solid`, `outlined`, `glow`) instead of hand-styled surface divs.
- **Data display:** Use the library `Badge`, `Tag`, `Stat`, `Separator`, `Table` instead of rolling custom equivalents.
- **Page sections:** Use `PageHeader` from the library for any title + subtitle + optional action row at the top of a page or section.

**Rule:** If you are about to write a `<div style={{ display: "flex", ... }}>` or a raw `<button>` or `<input>`, stop and use the equivalent Chakra primitive or library component instead.

**New shared components** (anything reused across 2+ places) go in `src/app/components/` — follow the four-step process: component file → showcase section → page.tsx → Sidebar.tsx.

**Dashboard-local components** (CRM-specific, not reused elsewhere) go in `src/app/dashboard/_components/` and may use Chakra primitives directly.

## Icons — `react-icons`

The project uses [`react-icons`](https://react-icons.github.io/react-icons/) for all icons. **Do not write custom inline SVGs** — find the equivalent in react-icons instead.

**Preferred sets (in order):**
1. **Lucide** (`react-icons/lu`) — stroke-based, consistent weight, matches the UI aesthetic. Use for almost everything: navigation, actions, status, UI chrome.
2. **Font Awesome 6** (`react-icons/fa6`) — use only when Lucide doesn't have a suitable icon (e.g. `FaPlay` for a filled play triangle on video cards).

**Usage:**
```tsx
import { LuSearch, LuBell } from "react-icons/lu";
import { FaPlay } from "react-icons/fa6";

<LuSearch size={13} />
<LuBell size={18} />
<FaPlay size={14} color="#34FDFE" />
```

All react-icons components accept `size`, `color`, `className`, and standard SVG props.

**Current icon assignments (dashboard nav):**

| Icon | Component | From |
|---|---|---|
| Dashboard | `LuLayoutDashboard` | `react-icons/lu` |
| Trainees | `LuUsers` | `react-icons/lu` |
| Videos | `LuSquarePlay` | `react-icons/lu` |
| Trainers | `LuUser` | `react-icons/lu` |
| Settings | `LuSettings` | `react-icons/lu` |
| Bell | `LuBell` | `react-icons/lu` |
| Search | `LuSearch` | `react-icons/lu` |
| Video play button | `FaPlay` | `react-icons/fa6` |

These are re-exported from `src/app/dashboard/_components/NavIcons.tsx` with CRM-specific class names already applied.

## Neon UI — `src/app/components/`

This is the project's shared component library. It lives at the `/components` route and has a live showcase at that URL.

**Rule: any UI element used in more than one place, or likely to be reused, must live here — not be re-implemented inline.** When you add a component:
1. Create the component file in `src/app/components/` (e.g. `Table.tsx`).
2. Add a section to `src/app/components/_showcase/sections.tsx` that exercises the component's variants/states.
3. Add the section to `src/app/components/page.tsx` (import + render).
4. Add a nav link to `src/app/components/_showcase/Sidebar.tsx` so it appears in the sidebar.

### Design tokens

Both the showcase (`.neon`) and the dashboard (`.crm`) scopes define the same CSS custom properties. Always use these tokens — never hardcode colors or surfaces.

| Token | Value |
|---|---|
| `--neon-pink` | `#fd6dbb` |
| `--neon-cyan` | `#34fdfe` |
| `--neon-bg` | `#070712` |
| `--neon-surface` | `#0f0f1e` |
| `--neon-surface-2` | `#141428` |
| `--neon-border` | `rgba(255,255,255,0.07)` |
| `--neon-text` | `#fff` |
| `--neon-text-muted` | `rgba(255,255,255,0.5)` |
| `--neon-text-dim` | `rgba(255,255,255,0.33)` |
| `--font-neon-body` | Space Grotesk |
| `--font-neon-mono` | Space Mono |
| `--font-neon-display` | Barlow Condensed |

### Styling approach

Components in `src/app/components/` must work in **both** the `.neon` (showcase) and `.crm` (dashboard) contexts. Follow these rules:

- **Use CSS custom properties** (`var(--neon-surface)`, etc.) so styles adapt to whichever scope wraps the component.
- **Use CSS Modules** (`.module.css` alongside the `.tsx`) for any styles that require pseudo-classes (`:hover`, `:focus`, `.active`), so they stay scoped without polluting globals.
- **Use Chakra UI** props (`Box`, `forwardRef` wrappers) for layout and simple visual styles when it avoids a separate CSS file.
- **Never** reference `.crm-*` classes inside `src/app/components/` — those are dashboard-only.

### Existing components

| Component | File | Notes |
|---|---|---|
| `Button` | `Button.tsx` | `colorScheme`, `variant`, `size`, `loading`, `disabled` |
| `IconButton` | `IconButton.tsx` | Square icon-only button |
| `Badge` | `Badge.tsx` | `colorScheme`, `variant` (solid/subtle/outline) |
| `Tag` | `Tag.tsx` | Removable label chip |
| `Card` / `CardHeader` / `CardBody` / `CardFooter` | `Card.tsx` | `variant` (solid/outlined/glow), `glowColor` |
| `Input` | `Input.tsx` | Neon-styled text input |
| `Textarea` | `Textarea.tsx` | Multi-line input |
| `Select` | `Select.tsx` | Dropdown |
| `Field` | `Field.tsx` | Label + helper/error wrapper for inputs |
| `Checkbox` | `Checkbox.tsx` | |
| `Radio` | `Radio.tsx` | Group with options array |
| `Switch` | `Switch.tsx` | Toggle |
| `Alert` | `Alert.tsx` | `status` (info/success/warning/error) |
| `Progress` | `Progress.tsx` | Linear, supports indeterminate |
| `ProgressCircle` | `ProgressCircle.tsx` | Circular |
| `Spinner` | `Spinner.tsx` | |
| `Skeleton` | `Skeleton.tsx` | Loading placeholder |
| `Stat` | `Stat.tsx` | Metric display with label and trend |
| `Separator` | `Separator.tsx` | Horizontal rule, optional accent |
| `Toast` / `toaster` | `Toast.tsx` | Imperative toast API |
| `Table` | `Table.tsx` | Generic sortable data table (see below) |
| `SessionsPanel` | `SessionsPanel.tsx` | Accordion list of coaching sessions with exercises and ratings (see below) |
| `ChatPanel` | `ChatPanel.tsx` | Scrollable message thread with send input; decoupled from persistence via `onSend` prop (see below) |
| `PageHeader` | `PageHeader.tsx` | Page/section title with optional subtitle and right-side action slot |

### `Table` component

```tsx
import { type ColumnDef, Table } from "@/app/components/Table";

type ColumnDef<T> = {
  key: keyof T & string;   // which field to read + sort by
  label: string;           // header text
  render?: (row: T) => React.ReactNode;  // custom cell; omit for string cast
};

<Table
  columns={cols}           // ColumnDef<T>[]
  rows={data}              // T[]
  getRowKey={r => r.id}   // unique key per row
  defaultSortKey="name"   // optional initial sort column
  emptyText="No items."   // optional empty state message
  onRowClick={r => ...}   // optional row click handler
/>
```

- Sorting is built-in on every column. Click a header to sort, click again to reverse.
- `render` is display-only; sorting always uses `row[key]`, so numeric and date columns sort correctly even with rich cell content.
- Null values always sink to the bottom of the sort.
- Styles use CSS Modules (`Table.module.css`) with `--neon-*` tokens, so the component works in both showcase and dashboard.

### `SessionsPanel` component

```tsx
import { type SessionEntry, SessionsPanel } from "@/app/components/SessionsPanel";

type SessionEntry = {
  id: string;
  occurredAt: Date;
  energyRating?: number | null;  // 1–5; renders star rating in header
  painRating?: number | null;    // 1–5; renders star rating in header
  comment?: string | null;       // shown as "Client Feedback" block
  exercises: {
    id: string;
    name: string;
    sets: number;
    reps: number;
    comment?: string | null;
  }[];
};

<SessionsPanel
  sessions={entries}           // SessionEntry[]
  accentColor="#FD6DBB"        // optional; defaults to --neon-pink
/>
```

- Sessions are sorted newest-first automatically; numbered from highest (most recent) down.
- The first session is expanded by default; click any header to expand/collapse.
- Energy rating uses `accentColor`; pain rating is always red (`#f87171`).
- Styles in `SessionsPanel.module.css` — works in both `.neon` and `.crm` contexts.

**Usage with DB types** — derive the prop type directly from the query rather than duplicating fields:
```tsx
import type { TraineeRow } from "@/db/queries/trainees";
// TraineeRow["coachingSessions"] satisfies SessionEntry[]
```

### `ChatPanel` component

```tsx
import { type ChatMessage, type ChatParticipant, ChatPanel } from "@/app/components/ChatPanel";

type ChatMessage = {
  id: string;
  content: { text: string };
  createdAt: Date;
  sender: { id: string; name: string; email: string };
};

type ChatParticipant = { id: string; name: string; email: string };

<ChatPanel
  initialMessages={msgs}         // ChatMessage[]
  currentUserId={user.id}        // messages from this ID appear on the left
  participant={trainee}          // ChatParticipant — shown in the header
  onSend={async (text) => msg}   // (text: string) => Promise<ChatMessage>
/>
```

- Messages from `currentUserId` appear on the left with pink bubbles; all others appear on the right.
- Pressing Enter or clicking the send button calls `onSend`. The returned `ChatMessage` is appended optimistically — no refetch needed.
- A typing indicator (`···`) is shown while `onSend` is in flight via `useTransition`.
- Styles in `ChatPanel.module.css`.

**Server Component constraint** — `onSend` is a function, so `ChatPanel` cannot be rendered directly from a Server Component. Wrap it in a thin Client Component that imports the server action and binds any route-scoped values (e.g. `chatId`):

```tsx
// dashboard/trainees/[id]/_components/TraineeChatPanel.tsx
"use client";
import { ChatPanel, type ChatMessage } from "@/app/components/ChatPanel";
import { sendMessage } from "../actions"; // server action

export function TraineeChatPanel({ chatId, ...rest }) {
  return (
    <ChatPanel
      {...rest}
      onSend={async (text) => {
        const msg = await sendMessage(chatId, text);
        return msg as ChatMessage;
      }}
    />
  );
}
```

## CRM dashboard — `src/app/dashboard/`

Dashboard-specific layout, styles, and page components live here. The layout imports `crm.css` which defines `.crm-*` utility classes for the dashboard chrome (sidebar, topbar, page padding, stat cards, table wrappers, etc.).

**Dashboard-local components** (things specific to the CRM and unlikely to be reused elsewhere) go in `src/app/dashboard/_components/`. These **may** use `.crm-*` classes and dashboard-only tokens like `--font-crm-display`.

When a dashboard component becomes general enough to reuse (e.g. the `Table`), move it to `src/app/components/` and update the showcase.

<!-- END:nextjs-agent-rules -->
