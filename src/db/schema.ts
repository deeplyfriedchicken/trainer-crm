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

/* ───────────────────────────── Users ───────────────────────────── */

export const users = pgTable(
  "users",
  {
    id: id(),
    email: text("email").notNull(),
    name: text("name").notNull(),
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

/* ──────────────────── Trainer ↔ Trainee Assignments ──────────────────── */

export const trainerAssignments = pgTable(
  "trainer_assignments",
  {
    id: id(),
    trainerId: text("trainer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    traineeId: text("trainee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
  },
  (t) => [
    index("trainer_assignments_trainer_idx").on(t.trainerId),
    index("trainer_assignments_trainee_idx").on(t.traineeId),
    // One active assignment per (trainer, trainee) pair. Ended rows stay as history.
    uniqueIndex("trainer_assignments_active_pair_idx")
      .on(t.trainerId, t.traineeId)
      .where(sql`${t.endedAt} IS NULL`),
  ],
);

/* ───────────────────────────── Videos ──────────────────────────── */

export const videoStatus = pgEnum("video_status", [
  "uploading",
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
    ...timestamps,
  },
  (t) => [
    index("videos_uploader_idx").on(t.uploaderId),
    uniqueIndex("videos_file_key_idx").on(t.fileKey),
  ],
);

/* ───────────────────── Coaching Sessions ───────────────────── */

export const coachingSessions = pgTable(
  "coaching_sessions",
  {
    id: id(),
    traineeId: text("trainee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    // Client-reported feedback. Null = not yet answered by the trainee.
    completed: boolean("completed"),
    energyRating: integer("energy_rating"),
    painRating: integer("pain_rating"),
    comment: text("comment"),
    ...timestamps,
    ...authorship,
  },
  (t) => [
    index("coaching_sessions_trainee_idx").on(t.traineeId),
    index("coaching_sessions_occurred_at_idx").on(t.occurredAt),
    index("coaching_sessions_created_by_idx").on(t.createdBy),
    check(
      "coaching_sessions_energy_rating_range",
      sql`${t.energyRating} IS NULL OR (${t.energyRating} BETWEEN 1 AND 5)`,
    ),
    check(
      "coaching_sessions_pain_rating_range",
      sql`${t.painRating} IS NULL OR (${t.painRating} BETWEEN 1 AND 5)`,
    ),
  ],
);

/* ───────────────────────── Exercises ──────────────────────── */

export const exercises = pgTable(
  "exercises",
  {
    id: id(),
    sessionId: text("session_id")
      .notNull()
      .references(() => coachingSessions.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sets: integer("sets").notNull(),
    reps: integer("reps").notNull(),
    comment: text("comment"),
    ...timestamps,
    ...authorship,
  },
  (t) => [
    index("exercises_session_idx").on(t.sessionId),
    index("exercises_created_by_idx").on(t.createdBy),
  ],
);

/* ──────────────── Session / Exercise ↔ Video links ──────────────── */

export const coachingSessionVideos = pgTable(
  "coaching_session_videos",
  {
    sessionId: text("session_id")
      .notNull()
      .references(() => coachingSessions.id, { onDelete: "cascade" }),
    videoId: text("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    ...timestamps,
    ...authorship,
  },
  (t) => [
    primaryKey({ columns: [t.sessionId, t.videoId] }),
    index("coaching_session_videos_video_idx").on(t.videoId),
    index("coaching_session_videos_created_by_idx").on(t.createdBy),
  ],
);

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
  trainerAssignments: many(trainerAssignments, {
    relationName: "trainer_assignments_trainer",
  }),
  traineeAssignments: many(trainerAssignments, {
    relationName: "trainer_assignments_trainee",
  }),
  uploadedVideos: many(videos, { relationName: "videos_uploader" }),
  coachingSessions: many(coachingSessions, {
    relationName: "coaching_sessions_trainee",
  }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
}));

export const trainerAssignmentsRelations = relations(
  trainerAssignments,
  ({ one }) => ({
    trainer: one(users, {
      fields: [trainerAssignments.trainerId],
      references: [users.id],
      relationName: "trainer_assignments_trainer",
    }),
    trainee: one(users, {
      fields: [trainerAssignments.traineeId],
      references: [users.id],
      relationName: "trainer_assignments_trainee",
    }),
  }),
);

export const videosRelations = relations(videos, ({ one, many }) => ({
  uploader: one(users, {
    fields: [videos.uploaderId],
    references: [users.id],
    relationName: "videos_uploader",
  }),
  exerciseLinks: many(exerciseVideos),
  sessionLinks: many(coachingSessionVideos),
  videoTags: many(videoTags),
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

export const coachingSessionsRelations = relations(
  coachingSessions,
  ({ one, many }) => ({
    trainee: one(users, {
      fields: [coachingSessions.traineeId],
      references: [users.id],
      relationName: "coaching_sessions_trainee",
    }),
    creator: one(users, {
      fields: [coachingSessions.createdBy],
      references: [users.id],
      relationName: "coaching_sessions_creator",
    }),
    updater: one(users, {
      fields: [coachingSessions.updatedBy],
      references: [users.id],
      relationName: "coaching_sessions_updater",
    }),
    exercises: many(exercises),
    videoLinks: many(coachingSessionVideos),
  }),
);

export const coachingSessionVideosRelations = relations(
  coachingSessionVideos,
  ({ one }) => ({
    session: one(coachingSessions, {
      fields: [coachingSessionVideos.sessionId],
      references: [coachingSessions.id],
    }),
    video: one(videos, {
      fields: [coachingSessionVideos.videoId],
      references: [videos.id],
    }),
  }),
);

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  session: one(coachingSessions, {
    fields: [exercises.sessionId],
    references: [coachingSessions.id],
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

/* ────────────────────────── Inferred types ─────────────────────── */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole = (typeof userRole.enumValues)[number];
export type TrainerAssignment = typeof trainerAssignments.$inferSelect;
export type NewTrainerAssignment = typeof trainerAssignments.$inferInsert;
export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
export type VideoStatus = (typeof videoStatus.enumValues)[number];
export type CoachingSession = typeof coachingSessions.$inferSelect;
export type NewCoachingSession = typeof coachingSessions.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
export type ExerciseVideo = typeof exerciseVideos.$inferSelect;
export type NewExerciseVideo = typeof exerciseVideos.$inferInsert;
export type CoachingSessionVideo = typeof coachingSessionVideos.$inferSelect;
export type NewCoachingSessionVideo =
  typeof coachingSessionVideos.$inferInsert;
export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type VideoTag = typeof videoTags.$inferSelect;
export type NewVideoTag = typeof videoTags.$inferInsert;
