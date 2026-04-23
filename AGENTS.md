<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.


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

## Relations (Drizzle)

- `users` → many `user_roles`; many `trainer_assignments` (as trainer and as trainee); many `videos` (as uploader); many `coaching_sessions` (as trainee, via `coaching_sessions_trainee`).
- `trainer_assignments` → one trainer, one trainee (both `users`).
- `videos` → one uploader (`users`); many `exercise_videos`; many `coaching_session_videos`.
- `coaching_sessions` → one trainee, one creator, one updater (all `users`, disambiguated by relation names `coaching_sessions_trainee` / `coaching_sessions_creator` / `coaching_sessions_updater`); many `exercises`; many `coaching_session_videos`.
- `exercises` → one parent `coaching_session`; one creator, one updater (both `users`, relation names `exercises_creator` / `exercises_updater`); many `exercise_videos`.
- `coaching_session_videos` → one `coaching_session`, one `video`.
- `exercise_videos` → one `exercise`, one `video`.

<!-- END:nextjs-agent-rules -->
