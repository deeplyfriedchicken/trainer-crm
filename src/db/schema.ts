import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
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
  bigint,
  boolean,
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

/* ───────────────────────────── Users ───────────────────────────── */

export const users = pgTable(
  "users",
  {
    id: id(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    pin: text("pin"),
    pinUpdatedAt: timestamp("pin_updated_at", { withTimezone: true }),
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
    title: text("title").notNull(),
    description: text("description"),
    fileKey: text("file_key").notNull(),
    fileUrl: text("file_url").notNull(),
    fileName: text("file_name").notNull(),
    fileSizeBytes: bigint("file_size_bytes", { mode: "number" }).notNull(),
    mimeType: text("mime_type").notNull(),
    durationSeconds: integer("duration_seconds"),
    status: videoStatus("status").notNull().default("uploading"),
    originalFileKey: text("original_file_key"),
    ...timestamps,
  },
  (t) => [
    index("videos_uploader_idx").on(t.uploaderId),
    uniqueIndex("videos_file_key_idx").on(t.fileKey),
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
    name: text("name").notNull().default(""),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    comment: text("comment"),
    ...timestamps,
    ...authorship,
  },
  (t) => [
    index("workout_plans_trainee_idx").on(t.traineeId),
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
    comment: text("comment"),
    ...timestamps,
    ...authorship,
  },
  (t) => [
    index("exercises_plan_idx").on(t.workoutPlanId),
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
    energyRating: integer("energy_rating"),
    comment: text("comment"),
    ...timestamps,
    ...authorship,
  },
  (t) => [
    index("workouts_trainee_idx").on(t.traineeId),
    index("workouts_plan_idx").on(t.workoutPlanId),
    index("workouts_created_at_idx").on(t.createdAt),
    check(
      "workouts_energy_rating_range",
      sql`${t.energyRating} IS NULL OR (${t.energyRating} BETWEEN 1 AND 10)`,
    ),
    check(
      "workouts_pain_rating_range",
      sql`${t.painRating} IS NULL OR (${t.painRating} BETWEEN 1 AND 10)`,
    ),
  ],
);

/* ──────────────── Workout ↔ Exercise links ─────────────────────── */

export type WorkoutSetLog = {
  reps?: number;
  durationSeconds?: number;
  weightLbs?: number;
  completed: boolean;
};

export const workoutExercises = pgTable(
  "workout_exercises",
  {
    workoutId: text("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    setsData: jsonb("sets_data").$type<WorkoutSetLog[]>(),
    ...timestamps,
    ...authorship,
  },
  (t) => [
    primaryKey({ columns: [t.workoutId, t.exerciseId] }),
    index("workout_exercises_exercise_idx").on(t.exerciseId),
    index("workout_exercises_created_by_idx").on(t.createdBy),
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
    trainerId: text("trainer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("chats_trainee_trainer_idx").on(t.traineeId, t.trainerId),
    index("chats_trainee_idx").on(t.traineeId),
    index("chats_trainer_idx").on(t.trainerId),
  ],
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

/* ─────────────────────────── Video Tags ────────────────────────── */

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
  exerciseLinks: many(exerciseVideos),
  workoutPlanLinks: many(workoutPlanVideos),
  workoutLinks: many(workoutVideos),
  videoTags: many(videoTags),
}));

export const workoutPlansRelations = relations(workoutPlans, ({ one, many }) => ({
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
}));

export const workoutPlanVideosRelations = relations(workoutPlanVideos, ({ one }) => ({
  workoutPlan: one(workoutPlans, {
    fields: [workoutPlanVideos.workoutPlanId],
    references: [workoutPlans.id],
  }),
  video: one(videos, {
    fields: [workoutPlanVideos.videoId],
    references: [videos.id],
  }),
}));

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
  exerciseLinks: many(workoutExercises),
  videoLinks: many(workoutVideos),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one }) => ({
  workout: one(workouts, {
    fields: [workoutExercises.workoutId],
    references: [workouts.id],
  }),
  exercise: one(exercises, {
    fields: [workoutExercises.exerciseId],
    references: [exercises.id],
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
  trainer: one(users, {
    fields: [chats.trainerId],
    references: [users.id],
    relationName: "chats_trainer",
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

/* ────────────────────────── Inferred types ─────────────────────── */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole = (typeof userRole.enumValues)[number];
export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
export type VideoStatus = (typeof videoStatus.enumValues)[number];
export type ExerciseType = (typeof exerciseType.enumValues)[number];
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
