# Domain Glossary

## Core Concepts

### Plan
The trainer's prescription for a trainee — a named collection of exercises with sets, reps/duration, and optional weight. What the trainee is supposed to do. Users always see the latest published version of a plan; versioning is an implementation detail invisible to non-technical users. Internally, plans are grouped into a `workout_plan_group` that holds all versions (draft, published, archived).

### Workout
A logged record of a trainee actually performing a Plan. Captures which exercises were completed, per-set data, duration, and optional energy/pain ratings. **Do not use "session" as a synonym** — "session" is a deprecated term. Note: `SessionsPanel` in the codebase is a misnamed legacy component that should eventually be renamed `WorkoutsPanel`.

### Exercise
A single movement within a Plan. Has a type (reps-based or duration-based), sets, and optional weight. Exercises have a display order (position) within the plan.

### Client Portal
The trainee-facing PWA. Official name is TBD — working name is "Client Training App". Accessed via a unique encrypted URL (`/client/[token]`). Trainees use it to view their current plan, log workouts, and report pain flags. Installable as a home-screen app.

### Pain Flag
A pain report created by a trainee during a workout in the Client Portal. Records a body-part location, severity, and whether the pain is recurring. Optionally linked to a specific exercise or set within the workout. Trainers review pain flags to monitor client health.

### Video
An S3-backed media file. Can be attached to: an exercise (trainer uploads a demo), a logged workout (trainee uploads a form-check), or a trainee directly (personal library visible on the trainee's dashboard page). Plan-level video attachments exist in the schema but are not actively used. Each individual logged set can also have a form-check video attached.

### Set (Workout Set)
A single logged set within a workout. Records actual reps/duration, weight, completion status, start/end time, optional RPE, optional RIR, an optional form-check video, and a comment. The atomic unit of workout logging.

### CRM
The trainer-facing web application (lives at `/dashboard`). Where trainers and admins manage trainees, plans, workouts, videos, and chat. Do not call it "the dashboard" — the correct term is "the CRM".

### Tag
A label applied to a video. Used to categorise and sort the video library. Nascent feature — intended to support filtering, categorisation, and future ML/data-training workflows.

### Chat
A messaging thread between a trainee and the training staff. One thread per trainee — all trainers who message that trainee share it. Used for coaching communication.

### RPE (Rate of Perceived Exertion)
A 1–10 trainer-side metric for how hard an effort felt. Trainers understand this term; it may be surfaced to trainees under a different label (e.g. "How hard did that feel?").

### RIR (Reps in Reserve)
A 0–10 trainer-side metric for how many more reps a trainee could have performed. Trainer vocabulary; may be presented differently to trainees.

### Plan Version States
- **Draft** — not yet visible to trainees. Work in progress.
- **Published** — visible to trainees. Only the latest published version is shown.
- **Archived** — internal DB state only. A version that was superseded by a newer draft or publish. Not visible to trainers or trainees. Kept for historical record.

### Hidden Exercise
An exercise marked `isHidden` by a trainer — included in the plan for internal planning purposes but not visible to the trainee. Effectively absent from the trainee's view of the plan even when the plan is published.

## Actors

### Trainee
A client who receives coaching. Has access to the Client Portal (PWA) to view workout plans and log workouts. Cannot access the dashboard. Any user can hold the Trainee role — including Trainers and Admins — roles are not mutually exclusive.

### Trainer
A coaching staff member. Can create and manage workout plans for trainees, upload videos, chat with trainees, and log workouts on behalf of trainees. Accesses the system via the dashboard.

### Trainer Manager
A trainer with additional staff-management permissions. Can add and remove trainers from the system. Cannot promote users to Trainer Manager (admin-only). Otherwise has the same capabilities as a Trainer.

### Admin
The highest-privilege role. Has all Trainer Manager capabilities plus: can promote users to Trainer Manager, and can delete videos.
