<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# PNPM
Use pnpm


# Database schema

PostgreSQL via Drizzle ORM. Schema lives at `src/db/schema.ts`; migrations in `drizzle/`. Every table uses cuid2 `text` ids and `created_at`/`updated_at` timestamptz where noted. Tables that record audit attribution (`coaching_sessions`, `exercises`, `coaching_session_videos`, `exercise_videos`) also carry `created_by` / `updated_by` via a shared `authorship` block: both NOT NULL, FK → `users.id` ON DELETE RESTRICT.

## Enums

- `user_role`: `admin` | `trainer_manager` | `trainer` | `trainee`
- `video_status`: `uploading` | `ready` | `failed`

## `users`
| column      | type         | notes                        |
|-------------|--------------|------------------------------|
| id          | text PK      | cuid2                        |
| email       | text         | NOT NULL, unique (`users_email_idx`) |
| name        | text         | NOT NULL                     |
| created_at  | timestamptz  | default now()                |
| updated_at  | timestamptz  | default now(), auto-updates  |

## `user_roles`
Composite PK `(user_id, role)` — a user may hold multiple roles.

| column       | type        | notes                                            |
|--------------|-------------|--------------------------------------------------|
| user_id      | text        | FK → `users.id` ON DELETE CASCADE                |
| role         | user_role   | NOT NULL                                         |
| assigned_at  | timestamptz | default now()                                    |

Indexes: `user_roles_role_idx` on `role`.

## `trainer_assignments`
Links a trainer to a trainee. History is retained: an assignment ends by setting `ended_at` rather than deleting the row.

| column      | type        | notes                                         |
|-------------|-------------|-----------------------------------------------|
| id          | text PK     | cuid2                                         |
| trainer_id  | text        | FK → `users.id` ON DELETE CASCADE             |
| trainee_id  | text        | FK → `users.id` ON DELETE CASCADE             |
| assigned_at | timestamptz | default now()                                 |
| ended_at    | timestamptz | nullable; NULL = active                       |

Indexes:
- `trainer_assignments_trainer_idx` on `trainer_id`
- `trainer_assignments_trainee_idx` on `trainee_id`
- `trainer_assignments_active_pair_idx` — **partial unique** on `(trainer_id, trainee_id) WHERE ended_at IS NULL`. Only one active pairing at a time; ended rows stay as history.

## `videos`
Uploaded via UploadThing; columns map directly from the webhook payload. Videos are never tied to a trainee directly — attribution flows through the join tables `coaching_session_videos` and `exercise_videos`.

| column            | type          | notes                                              |
|-------------------|---------------|----------------------------------------------------|
| id                | text PK       | cuid2                                              |
| uploader_id       | text          | FK → `users.id` ON DELETE RESTRICT                 |
| title             | text          | NOT NULL                                           |
| description       | text nullable |                                                    |
| file_key          | text          | NOT NULL, unique (`videos_file_key_idx`)           |
| file_url          | text          | NOT NULL                                           |
| file_name         | text          | NOT NULL                                           |
| file_size_bytes   | bigint        | NOT NULL (mapped as `number`)                      |
| mime_type         | text          | NOT NULL                                           |
| duration_seconds  | integer       | nullable                                           |
| status            | video_status  | NOT NULL, default `uploading`                      |
| created_at        | timestamptz   | default now()                                      |
| updated_at        | timestamptz   | default now(), auto-updates                        |

Indexes: `videos_uploader_idx` on `uploader_id`, unique `videos_file_key_idx` on `file_key`.

## `coaching_sessions`
One row per session conducted for a trainee. Client-feedback fields (`completed`, `energy_rating`, `pain_rating`, `comment`) are nullable — they're filled in when the trainee answers the post-session questionnaire.

| column         | type          | notes                                               |
|----------------|---------------|-----------------------------------------------------|
| id             | text PK       | cuid2                                               |
| trainee_id     | text          | FK → `users.id` ON DELETE CASCADE                   |
| occurred_at    | timestamptz   | NOT NULL; when the session happened                 |
| completed      | boolean       | nullable; NULL = not yet answered                   |
| energy_rating  | integer       | nullable; CHECK `IS NULL OR BETWEEN 1 AND 5`        |
| pain_rating    | integer       | nullable; CHECK `IS NULL OR BETWEEN 1 AND 5`        |
| comment        | text          | nullable                                            |
| created_at     | timestamptz   | default now()                                       |
| updated_at     | timestamptz   | default now(), auto-updates                         |
| created_by     | text          | FK → `users.id` ON DELETE RESTRICT, NOT NULL        |
| updated_by     | text          | FK → `users.id` ON DELETE RESTRICT, NOT NULL        |

Indexes: `coaching_sessions_trainee_idx`, `coaching_sessions_occurred_at_idx`, `coaching_sessions_created_by_idx`.
Check constraints: `coaching_sessions_energy_rating_range`, `coaching_sessions_pain_rating_range`.

## `exercises`
Child of `coaching_sessions` — a session has many exercises. Deleting a session cascades to its exercises.

| column     | type        | notes                                               |
|------------|-------------|-----------------------------------------------------|
| id         | text PK     | cuid2                                               |
| session_id | text        | FK → `coaching_sessions.id` ON DELETE CASCADE       |
| name       | text        | NOT NULL                                            |
| sets       | integer     | NOT NULL                                            |
| reps       | integer     | NOT NULL                                            |
| comment    | text        | nullable                                            |
| created_at | timestamptz | default now()                                       |
| updated_at | timestamptz | default now(), auto-updates                         |
| created_by | text        | FK → `users.id` ON DELETE RESTRICT, NOT NULL        |
| updated_by | text        | FK → `users.id` ON DELETE RESTRICT, NOT NULL        |

Indexes: `exercises_session_idx`, `exercises_created_by_idx`.

## `coaching_session_videos`
Join table linking a session to one or more rows in `videos` — for videos attached to the session as a whole rather than to a specific exercise. Both sides cascade on delete.

| column     | type        | notes                                                 |
|------------|-------------|-------------------------------------------------------|
| session_id | text        | FK → `coaching_sessions.id` ON DELETE CASCADE         |
| video_id   | text        | FK → `videos.id` ON DELETE CASCADE                    |
| created_at | timestamptz | default now()                                         |
| updated_at | timestamptz | default now(), auto-updates                           |
| created_by | text        | FK → `users.id` ON DELETE RESTRICT, NOT NULL          |
| updated_by | text        | FK → `users.id` ON DELETE RESTRICT, NOT NULL          |

Primary key: composite `(session_id, video_id)`.
Indexes: `coaching_session_videos_video_idx` on `video_id`, `coaching_session_videos_created_by_idx` on `created_by`.

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
Indexes: `exercise_videos_video_idx` on `video_id`, `exercise_videos_created_by_idx` on `created_by` (the `exercise_id` side is covered by the composite PK).

## `chats`
One chat thread per trainer ↔ trainee pair. Created on first message send via `getOrCreateChat`.

| column      | type        | notes                                         |
|-------------|-------------|-----------------------------------------------|
| id          | text PK     | cuid2                                         |
| trainee_id  | text        | FK → `users.id` ON DELETE CASCADE             |
| trainer_id  | text        | FK → `users.id` ON DELETE CASCADE             |
| created_at  | timestamptz | default now()                                 |
| updated_at  | timestamptz | default now(), auto-updates                   |

Indexes: `chats_trainee_trainer_idx` (unique), `chats_trainee_idx`, `chats_trainer_idx`.

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

| column     | type        | notes                        |
|------------|-------------|------------------------------|
| id         | text PK     | cuid2                        |
| name       | text        | NOT NULL, unique (`tags_name_idx`) |
| created_at | timestamptz | default now()                |

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

- `users` → many `user_roles`; many `trainer_assignments` (as trainer and as trainee); many `videos` (as uploader); many `coaching_sessions` (as trainee, via `coaching_sessions_trainee`).
- `trainer_assignments` → one trainer, one trainee (both `users`).
- `videos` → one uploader (`users`); many `exercise_videos`; many `coaching_session_videos`; many `videoTags`.
- `coaching_sessions` → one trainee, one creator, one updater (all `users`, disambiguated by relation names `coaching_sessions_trainee` / `coaching_sessions_creator` / `coaching_sessions_updater`); many `exercises`; many `coaching_session_videos`.
- `exercises` → one parent `coaching_session`; one creator, one updater (both `users`, relation names `exercises_creator` / `exercises_updater`); many `exercise_videos`.
- `coaching_session_videos` → one `coaching_session`, one `video`.
- `exercise_videos` → one `exercise`, one `video`.
- `tags` → many `videoTags`.
- `videoTags` → one `video`, one `tag`.

# Component system

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
