import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => createId());

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

const authorship = {
  createdBy: text("created_by")
    .notNull()
    .references((): AnyPgColumn => users.id, { onDelete: "restrict" }),
  updatedBy: text("updated_by")
    .notNull()
    .references((): AnyPgColumn => users.id, { onDelete: "restrict" }),
};

const createdByOnly = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  createdBy: text("created_by")
    .notNull()
    .references((): AnyPgColumn => users.id, { onDelete: "restrict" }),
};

/* ───────────────────────────── Users ───────────────────────────── */

export const users = pgTable(
  "users",
  {
    id: id(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    pin: text("pin"),
    pinUpdatedAt: timestamp("pin_updated_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

/* ─────────────────────────── User Roles ────────────────────────── */

export const userRole = pgEnum("user_role", [
  "admin",
  "trainer_manager",
  "trainer",
  "trainee",
]);

export const userRoles = pgTable(
  "user_roles",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: userRole("role").notNull(),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.role] }),
    index("user_roles_role_idx").on(t.role),
  ],
);

/* ───────────────────────────── Videos ──────────────────────────── */

export const videoStatus = pgEnum("video_status", [
  "uploading",
  "processing",
  "ready",
  "failed",
]);

export const videos = pgTable(
  "videos",
  {
    id: id(),
    uploaderId: text("uploader_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    traineeId: text("trainee_id").references(() => users.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    description: text("description"),
    fileKey: text("file_key").notNull(),
    fileUrl: text("file_url").notNull(),
    fileName: text("file_name").notNull(),
    fileSizeBytes: bigint("file_size_bytes", { mode: "number" }).notNull(),
    mimeType: text("mime_type").notNull(),
    durationSeconds: integer("duration_seconds"),
    originalWidth: integer("original_width"),
    originalHeight: integer("original_height"),
    status: videoStatus("status").notNull().default("uploading"),
    originalFileKey: text("original_file_key"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("videos_uploader_idx").on(t.uploaderId),
    uniqueIndex("videos_file_key_idx").on(t.fileKey),
  ],
);

/* ──────────────────── Workout Plan Groups ──────────────────────── */
// Declared before workoutPlans to allow the lazy circular FK on currentVersionId.

export const workoutPlanGroups = pgTable(
  "workout_plan_groups",
  {
    id: id(),
    traineeId: text("trainee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    currentVersionId: text("current_version_id").references(
      (): AnyPgColumn => workoutPlans.id,
      { onDelete: "set null" },
    ),
    ...timestamps,
    ...authorship,
  },
  (t) => [
    index("workout_plan_groups_trainee_idx").on(t.traineeId),
    index("workout_plan_groups_current_version_idx").on(t.currentVersionId),
  ],
);

/* ───────────────────── Workout Plans ───────────────────── */

export const workoutPlans = pgTable(
  "workout_plans",
  {
    id: id(),
    traineeId: text("trainee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workoutPlanGroupId: text("workout_plan_group_id").references(
      () => workoutPlanGroups.id,
      { onDelete: "cascade" },
    ),
    name: text("name").notNull().default(""),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    comment: text("comment"),
    versionStatus: text("version_status").notNull().default("draft"),
    versionNumber: integer("version_number").notNull().default(1),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
    ...authorship,
  },
  (t) => [
    index("workout_plans_trainee_idx").on(t.traineeId),
    index("workout_plans_group_idx").on(t.workoutPlanGroupId),
    index("workout_plans_occurred_at_idx").on(t.occurredAt),
    index("workout_plans_created_by_idx").on(t.createdBy),
  ],
);

/* ───────────────────────── Exercise Type ──────────────────── */

export const exerciseType = pgEnum("exercise_type", ["reps", "duration"]);

/* ───────────────────────── Exercises ──────────────────────── */

export const exercises = pgTable(
  "exercises",
  {
    id: id(),
    workoutPlanId: text("workout_plan_id")
      .notNull()
      .references(() => workoutPlans.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: exerciseType("type").notNull().default("reps"),
    sets: integer("sets").notNull(),
    reps: integer("reps"),
    durationSeconds: integer("duration_seconds"),
    weightLbs: real("weight_lbs"),
    position: integer("position").notNull(),
    comment: text("comment"),
    isHidden: boolean("is_hidden").notNull().default(false),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
    ...authorship,
  },
  (t) => [
    index("exercises_plan_idx").on(t.workoutPlanId),
    index("exercises_plan_position_idx").on(t.workoutPlanId, t.position),
    index("exercises_created_by_idx").on(t.createdBy),
    check(
      "exercises_type_fields_check",
      sql`(${t.type} = 'reps' AND ${t.reps} IS NOT NULL) OR (${t.type} = 'duration' AND ${t.durationSeconds} IS NOT NULL)`,
    ),
  ],
);

/* ──────────────────── Workout Plan ↔ Video links ──────────────── */

export const workoutPlanVideos = pgTable(
  "workout_plan_videos",
  {
    workoutPlanId: text("workout_plan_id")
      .notNull()
      .references(() => workoutPlans.id, { onDelete: "cascade" }),
    videoId: text("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    ...timestamps,
    ...authorship,
  },
  (t) => [
    primaryKey({ columns: [t.workoutPlanId, t.videoId] }),
    index("workout_plan_videos_video_idx").on(t.videoId),
    index("workout_plan_videos_created_by_idx").on(t.createdBy),
  ],
);

/* ──────────────── Exercise ↔ Video links ──────────────────────── */

export const exerciseVideos = pgTable(
  "exercise_videos",
  {
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    videoId: text("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    ...timestamps,
    ...authorship,
  },
  (t) => [
    primaryKey({ columns: [t.exerciseId, t.videoId] }),
    index("exercise_videos_video_idx").on(t.videoId),
    index("exercise_videos_created_by_idx").on(t.createdBy),
  ],
);

/* ───────────────────────── Workouts ───────────────────────────── */

export const workouts = pgTable(
  "workouts",
  {
    id: id(),
    traineeId: text("trainee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workoutPlanId: text("workout_plan_id").references(() => workoutPlans.id, {
      onDelete: "set null",
    }),
    durationSeconds: integer("duration_seconds").notNull(),
    painRating: integer("pain_rating"),
    preSessionEnergy: integer("pre_session_energy"),
    preSessionSoreness: integer("pre_session_soreness"),
    preSessionStress: integer("pre_session_stress"),
    preSessionNote: text("pre_session_note"),
    postSessionEnergy: integer("post_session_energy"),
    sessionQuality: integer("session_quality"),
    sessionQualityRatedBy: text("session_quality_rated_by").references(
      () => users.id,
      { onDelete: "set null" },
    ),
    sessionQualityRatedAt: timestamp("session_quality_rated_at", {
      withTimezone: true,
    }),
    traineeRating: integer("trainee_rating"),
    traineeRatingRatedAt: timestamp("trainee_rating_rated_at", {
      withTimezone: true,
    }),
    totalVolumeLbs: real("total_volume_lbs"),
    totalWorkSeconds: integer("total_work_seconds"),
    totalRestSeconds: integer("total_rest_seconds"),
    adherencePercent: real("adherence_percent"),
    averageRpe: real("average_rpe"),
    painFlagCount: integer("pain_flag_count"),
    comment: text("comment"),
    metadata: jsonb("metadata"),
    ...timestamps,
    ...authorship,
  },
  (t) => [
    index("workouts_trainee_idx").on(t.traineeId),
    index("workouts_plan_idx").on(t.workoutPlanId),
    index("workouts_created_at_idx").on(t.createdAt),
    check(
      "workouts_pain_rating_range",
      sql`${t.painRating} IS NULL OR (${t.painRating} BETWEEN 1 AND 10)`,
    ),
    check(
      "workouts_post_session_energy_range",
      sql`${t.postSessionEnergy} IS NULL OR (${t.postSessionEnergy} BETWEEN 1 AND 10)`,
    ),
    check(
      "workouts_pre_session_energy_range",
      sql`${t.preSessionEnergy} IS NULL OR (${t.preSessionEnergy} BETWEEN 1 AND 10)`,
    ),
    check(
      "workouts_pre_session_soreness_range",
      sql`${t.preSessionSoreness} IS NULL OR (${t.preSessionSoreness} BETWEEN 1 AND 10)`,
    ),
    check(
      "workouts_pre_session_stress_range",
      sql`${t.preSessionStress} IS NULL OR (${t.preSessionStress} BETWEEN 1 AND 10)`,
    ),
    check(
      "workouts_session_quality_range",
      sql`${t.sessionQuality} IS NULL OR (${t.sessionQuality} BETWEEN 1 AND 10)`,
    ),
    check(
      "workouts_trainee_rating_range",
      sql`${t.traineeRating} IS NULL OR (${t.traineeRating} BETWEEN 1 AND 10)`,
    ),
  ],
);

/* ──────────────── Workout ↔ Exercise links ─────────────────────── */

export const workoutExercises = pgTable(
  "workout_exercises",
  {
    workoutId: text("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    ...timestamps,
    ...authorship,
  },
  (t) => [
    primaryKey({ columns: [t.workoutId, t.exerciseId] }),
    index("workout_exercises_exercise_idx").on(t.exerciseId),
    index("workout_exercises_created_by_idx").on(t.createdBy),
  ],
);

/* ───────────────────────── Workout Sets ───────────────────────── */

export const workoutSets = pgTable(
  "workout_sets",
  {
    id: id(),
    workoutId: text("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    reps: integer("reps"),
    durationSeconds: integer("duration_seconds"),
    weightLbs: real("weight_lbs"),
    completed: boolean("completed").notNull().default(false),
    startedAt: timestamp("started_at", { withTimezone: true }),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    rpe: integer("rpe"),
    rir: integer("rir"),
    videoId: text("video_id").references(() => videos.id, {
      onDelete: "set null",
    }),
    comment: text("comment"),
    metadata: jsonb("metadata"),
    ...timestamps,
    ...authorship,
  },
  (t) => [
    index("workout_sets_workout_exercise_idx").on(
      t.workoutId,
      t.exerciseId,
      t.position,
    ),
    index("workout_sets_workout_idx").on(t.workoutId),
    index("workout_sets_exercise_idx").on(t.exerciseId),
    index("workout_sets_video_idx").on(t.videoId),
    check(
      "workout_sets_rpe_range",
      sql`${t.rpe} IS NULL OR (${t.rpe} BETWEEN 1 AND 10)`,
    ),
    check(
      "workout_sets_rir_range",
      sql`${t.rir} IS NULL OR (${t.rir} BETWEEN 0 AND 10)`,
    ),
  ],
);

/* ───────────────────────── Pain Flags ─────────────────────────── */

export const painFlags = pgTable(
  "pain_flags",
  {
    id: id(),
    workoutId: text("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id").references(() => exercises.id, {
      onDelete: "set null",
    }),
    workoutSetId: text("workout_set_id").references(() => workoutSets.id, {
      onDelete: "set null",
    }),
    location: text("location").notNull(),
    severity: integer("severity").notNull(),
    isRecurring: boolean("is_recurring").notNull().default(false),
    note: text("note"),
    ...createdByOnly,
  },
  (t) => [
    index("pain_flags_workout_idx").on(t.workoutId),
    index("pain_flags_exercise_idx").on(t.exerciseId),
    index("pain_flags_workout_set_idx").on(t.workoutSetId),
    check(
      "pain_flags_severity_range",
      sql`${t.severity} BETWEEN 1 AND 10`,
    ),
  ],
);

/* ───────────────────────── Workout Tags ───────────────────────── */

export const workoutTags = pgTable(
  "workout_tags",
  {
    workoutId: text("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    ...createdByOnly,
  },
  (t) => [
    primaryKey({ columns: [t.workoutId, t.tagId] }),
    index("workout_tags_tag_idx").on(t.tagId),
  ],
);

/* ──────────────── Workout ↔ Video links ────────────────────────── */

export const workoutVideos = pgTable(
  "workout_videos",
  {
    workoutId: text("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    videoId: text("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    ...timestamps,
    ...authorship,
  },
  (t) => [
    primaryKey({ columns: [t.workoutId, t.videoId] }),
    index("workout_videos_video_idx").on(t.videoId),
    index("workout_videos_created_by_idx").on(t.createdBy),
  ],
);

/* ──────────────────────────── Chats ────────────────────────────── */

export type MessageContent = { text: string };

export const chats = pgTable(
  "chats",
  {
    id: id(),
    traineeId: text("trainee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [uniqueIndex("chats_trainee_idx").on(t.traineeId)],
);

export const messages = pgTable(
  "messages",
  {
    id: id(),
    chatId: text("chat_id")
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    content: jsonb("content").notNull().$type<MessageContent>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("messages_chat_idx").on(t.chatId),
    index("messages_sender_idx").on(t.senderId),
  ],
);

/* ──────────────────────── Push Tokens ─────────────────────────── */

export const pushTokens = pgTable(
  "push_tokens",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    platform: text("platform").notNull().$type<"ios" | "android">(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("push_tokens_token_idx").on(t.token),
    index("push_tokens_user_idx").on(t.userId),
  ],
);

/* ──────────────────── Push Subscriptions ───────────────────────── */

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("push_subscriptions_endpoint_idx").on(t.endpoint),
    index("push_subscriptions_user_idx").on(t.userId),
  ],
);

/* ─────────────────────────── Tags ─────────────────────────────── */

export const tags = pgTable(
  "tags",
  {
    id: id(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("tags_name_idx").on(t.name)],
);

export const videoTags = pgTable(
  "video_tags",
  {
    videoId: text("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.videoId, t.tagId] }),
    index("video_tags_tag_idx").on(t.tagId),
  ],
);

/* ──────────────────────────── Relations ────────────────────────── */

export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
  uploadedVideos: many(videos, { relationName: "videos_uploader" }),
  directVideos: many(videos, { relationName: "videos_trainee" }),
  workoutPlanGroups: many(workoutPlanGroups, {
    relationName: "workout_plan_groups_trainee",
  }),
  workoutPlans: many(workoutPlans, { relationName: "workout_plans_trainee" }),
  workouts: many(workouts, { relationName: "workouts_trainee" }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  uploader: one(users, {
    fields: [videos.uploaderId],
    references: [users.id],
    relationName: "videos_uploader",
  }),
  trainee: one(users, {
    fields: [videos.traineeId],
    references: [users.id],
    relationName: "videos_trainee",
  }),
  exerciseLinks: many(exerciseVideos),
  workoutPlanLinks: many(workoutPlanVideos),
  workoutLinks: many(workoutVideos),
  videoTags: many(videoTags),
  workoutSets: many(workoutSets),
}));

export const workoutPlanGroupsRelations = relations(
  workoutPlanGroups,
  ({ one, many }) => ({
    trainee: one(users, {
      fields: [workoutPlanGroups.traineeId],
      references: [users.id],
      relationName: "workout_plan_groups_trainee",
    }),
    currentVersion: one(workoutPlans, {
      fields: [workoutPlanGroups.currentVersionId],
      references: [workoutPlans.id],
      relationName: "workout_plan_groups_current_version",
    }),
    versions: many(workoutPlans, { relationName: "workout_plans_group" }),
    creator: one(users, {
      fields: [workoutPlanGroups.createdBy],
      references: [users.id],
      relationName: "workout_plan_groups_creator",
    }),
    updater: one(users, {
      fields: [workoutPlanGroups.updatedBy],
      references: [users.id],
      relationName: "workout_plan_groups_updater",
    }),
  }),
);

export const workoutPlansRelations = relations(
  workoutPlans,
  ({ one, many }) => ({
    group: one(workoutPlanGroups, {
      fields: [workoutPlans.workoutPlanGroupId],
      references: [workoutPlanGroups.id],
      relationName: "workout_plans_group",
    }),
    trainee: one(users, {
      fields: [workoutPlans.traineeId],
      references: [users.id],
      relationName: "workout_plans_trainee",
    }),
    creator: one(users, {
      fields: [workoutPlans.createdBy],
      references: [users.id],
      relationName: "workout_plans_creator",
    }),
    updater: one(users, {
      fields: [workoutPlans.updatedBy],
      references: [users.id],
      relationName: "workout_plans_updater",
    }),
    exercises: many(exercises),
    videoLinks: many(workoutPlanVideos),
    workouts: many(workouts),
  }),
);

export const workoutPlanVideosRelations = relations(
  workoutPlanVideos,
  ({ one }) => ({
    workoutPlan: one(workoutPlans, {
      fields: [workoutPlanVideos.workoutPlanId],
      references: [workoutPlans.id],
    }),
    video: one(videos, {
      fields: [workoutPlanVideos.videoId],
      references: [videos.id],
    }),
  }),
);

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  workoutPlan: one(workoutPlans, {
    fields: [exercises.workoutPlanId],
    references: [workoutPlans.id],
  }),
  creator: one(users, {
    fields: [exercises.createdBy],
    references: [users.id],
    relationName: "exercises_creator",
  }),
  updater: one(users, {
    fields: [exercises.updatedBy],
    references: [users.id],
    relationName: "exercises_updater",
  }),
  videoLinks: many(exerciseVideos),
  workoutLinks: many(workoutExercises),
  sets: many(workoutSets),
  painFlags: many(painFlags),
}));

export const exerciseVideosRelations = relations(exerciseVideos, ({ one }) => ({
  exercise: one(exercises, {
    fields: [exerciseVideos.exerciseId],
    references: [exercises.id],
  }),
  video: one(videos, {
    fields: [exerciseVideos.videoId],
    references: [videos.id],
  }),
}));

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  trainee: one(users, {
    fields: [workouts.traineeId],
    references: [users.id],
    relationName: "workouts_trainee",
  }),
  workoutPlan: one(workoutPlans, {
    fields: [workouts.workoutPlanId],
    references: [workoutPlans.id],
  }),
  creator: one(users, {
    fields: [workouts.createdBy],
    references: [users.id],
    relationName: "workouts_creator",
  }),
  updater: one(users, {
    fields: [workouts.updatedBy],
    references: [users.id],
    relationName: "workouts_updater",
  }),
  sessionQualityRater: one(users, {
    fields: [workouts.sessionQualityRatedBy],
    references: [users.id],
    relationName: "workouts_session_quality_rater",
  }),
  exerciseLinks: many(workoutExercises),
  videoLinks: many(workoutVideos),
  sets: many(workoutSets),
  painFlags: many(painFlags),
  tags: many(workoutTags),
}));

export const workoutExercisesRelations = relations(
  workoutExercises,
  ({ one }) => ({
    workout: one(workouts, {
      fields: [workoutExercises.workoutId],
      references: [workouts.id],
    }),
    exercise: one(exercises, {
      fields: [workoutExercises.exerciseId],
      references: [exercises.id],
    }),
  }),
);

export const workoutSetsRelations = relations(workoutSets, ({ one }) => ({
  workout: one(workouts, {
    fields: [workoutSets.workoutId],
    references: [workouts.id],
  }),
  exercise: one(exercises, {
    fields: [workoutSets.exerciseId],
    references: [exercises.id],
  }),
  video: one(videos, {
    fields: [workoutSets.videoId],
    references: [videos.id],
  }),
  creator: one(users, {
    fields: [workoutSets.createdBy],
    references: [users.id],
    relationName: "workout_sets_creator",
  }),
  updater: one(users, {
    fields: [workoutSets.updatedBy],
    references: [users.id],
    relationName: "workout_sets_updater",
  }),
}));

export const painFlagsRelations = relations(painFlags, ({ one }) => ({
  workout: one(workouts, {
    fields: [painFlags.workoutId],
    references: [workouts.id],
  }),
  exercise: one(exercises, {
    fields: [painFlags.exerciseId],
    references: [exercises.id],
  }),
  workoutSet: one(workoutSets, {
    fields: [painFlags.workoutSetId],
    references: [workoutSets.id],
  }),
  creator: one(users, {
    fields: [painFlags.createdBy],
    references: [users.id],
    relationName: "pain_flags_creator",
  }),
}));

export const workoutTagsRelations = relations(workoutTags, ({ one }) => ({
  workout: one(workouts, {
    fields: [workoutTags.workoutId],
    references: [workouts.id],
  }),
  tag: one(tags, {
    fields: [workoutTags.tagId],
    references: [tags.id],
  }),
  creator: one(users, {
    fields: [workoutTags.createdBy],
    references: [users.id],
    relationName: "workout_tags_creator",
  }),
}));

export const workoutVideosRelations = relations(workoutVideos, ({ one }) => ({
  workout: one(workouts, {
    fields: [workoutVideos.workoutId],
    references: [workouts.id],
  }),
  video: one(videos, {
    fields: [workoutVideos.videoId],
    references: [videos.id],
  }),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  trainee: one(users, {
    fields: [chats.traineeId],
    references: [users.id],
    relationName: "chats_trainee",
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "messages_sender",
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  videoTags: many(videoTags),
  workoutTags: many(workoutTags),
}));

export const videoTagsRelations = relations(videoTags, ({ one }) => ({
  video: one(videos, {
    fields: [videoTags.videoId],
    references: [videos.id],
  }),
  tag: one(tags, {
    fields: [videoTags.tagId],
    references: [tags.id],
  }),
}));

export const pushTokensRelations = relations(pushTokens, ({ one }) => ({
  user: one(users, { fields: [pushTokens.userId], references: [users.id] }),
}));

export const pushSubscriptionsRelations = relations(
  pushSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [pushSubscriptions.userId],
      references: [users.id],
    }),
  }),
);

/* ────────────────────────── Inferred types ─────────────────────── */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole = (typeof userRole.enumValues)[number];
export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
export type VideoStatus = (typeof videoStatus.enumValues)[number];
export type ExerciseType = (typeof exerciseType.enumValues)[number];
export type WorkoutPlanGroup = typeof workoutPlanGroups.$inferSelect;
export type NewWorkoutPlanGroup = typeof workoutPlanGroups.$inferInsert;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type NewWorkoutPlan = typeof workoutPlans.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
export type ExerciseVideo = typeof exerciseVideos.$inferSelect;
export type NewExerciseVideo = typeof exerciseVideos.$inferInsert;
export type WorkoutPlanVideo = typeof workoutPlanVideos.$inferSelect;
export type NewWorkoutPlanVideo = typeof workoutPlanVideos.$inferInsert;
export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;
export type WorkoutSet = typeof workoutSets.$inferSelect;
export type NewWorkoutSet = typeof workoutSets.$inferInsert;
export type PainFlag = typeof painFlags.$inferSelect;
export type NewPainFlag = typeof painFlags.$inferInsert;
export type WorkoutTag = typeof workoutTags.$inferSelect;
export type NewWorkoutTag = typeof workoutTags.$inferInsert;
export type WorkoutVideo = typeof workoutVideos.$inferSelect;
export type NewWorkoutVideo = typeof workoutVideos.$inferInsert;
export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type VideoTag = typeof videoTags.$inferSelect;
export type NewVideoTag = typeof videoTags.$inferInsert;
export type PushToken = typeof pushTokens.$inferSelect;
export type NewPushToken = typeof pushTokens.$inferInsert;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;
