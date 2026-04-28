import { sql } from "drizzle-orm";
import { client, db } from "@/db";
import {
  coachingSessions,
  exercises,
  trainerAssignments,
  userRoles,
  users,
} from "@/db/schema";

async function seed() {
  await db.transaction(async (tx) => {
    await tx.execute(sql`
      TRUNCATE TABLE
        coaching_session_videos,
        exercise_videos,
        exercises,
        coaching_sessions,
        videos,
        trainer_assignments,
        user_roles,
        users
      RESTART IDENTITY CASCADE
    `);

    const [admin, morgan, sam] = await tx
      .insert(users)
      .values([
        { email: "kevin.a.cunanan@gmail.com", name: "Kevin Cunanan" },
        { email: "morgan@trainer.local", name: "Morgan Jones" },
        { email: "sam@trainer.local", name: "Sam Rivera" },
      ])
      .returning({ id: users.id });

    await tx.insert(userRoles).values([
      { userId: admin.id, role: "admin" },
      { userId: morgan.id, role: "trainee" },
      { userId: sam.id, role: "trainee" },
    ]);

    await tx.insert(trainerAssignments).values([
      { trainerId: admin.id, traineeId: morgan.id },
      { trainerId: admin.id, traineeId: sam.id },
    ]);

    const occurredAt = new Date(Date.now() - 3 * 60 * 60 * 1000);

    const [morganSession, samSession] = await tx
      .insert(coachingSessions)
      .values([
        {
          traineeId: morgan.id,
          occurredAt,
          createdBy: admin.id,
          updatedBy: admin.id,
        },
        {
          traineeId: sam.id,
          occurredAt,
          createdBy: admin.id,
          updatedBy: admin.id,
        },
      ])
      .returning({ id: coachingSessions.id });

    await tx.insert(exercises).values([
      {
        sessionId: morganSession.id,
        name: "Back Squat",
        sets: 4,
        reps: 6,
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      {
        sessionId: morganSession.id,
        name: "Romanian Deadlift",
        sets: 3,
        reps: 10,
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      {
        sessionId: morganSession.id,
        name: "Barbell Row",
        sets: 3,
        reps: 8,
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      {
        sessionId: morganSession.id,
        name: "Plank",
        sets: 3,
        reps: 1,
        comment: "60-second hold",
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      {
        sessionId: samSession.id,
        name: "Bench Press",
        sets: 4,
        reps: 5,
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      {
        sessionId: samSession.id,
        name: "Overhead Press",
        sets: 3,
        reps: 8,
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      {
        sessionId: samSession.id,
        name: "Pull-Up",
        sets: 3,
        reps: 8,
        createdBy: admin.id,
        updatedBy: admin.id,
      },
    ]);
  });

  console.log(
    "Seeded: 3 users (1 admin + 2 trainees), 3 roles, 2 trainer assignments, 2 sessions, 7 exercises.",
  );
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => client.end());
