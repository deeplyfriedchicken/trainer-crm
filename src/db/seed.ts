import { sql } from "drizzle-orm";
import { client, db } from "@/db";
import {
  exercises,
  trainerAssignments,
  userRoles,
  users,
  workoutExercises,
  workoutPlans,
  workouts,
} from "@/db/schema";

async function seed() {
  await db.transaction(async (tx) => {
    await tx.execute(sql`
      TRUNCATE TABLE
        workout_videos,
        workout_exercises,
        workouts,
        workout_plan_videos,
        exercise_videos,
        exercises,
        workout_plans,
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

    const planDate1 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const planDate2 = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    // ── Morgan's workout plans ────────────────────────────────────────────
    const [morganPlan1, morganPlan2] = await tx
      .insert(workoutPlans)
      .values([
        {
          traineeId: morgan.id,
          name: "Lower Body Power",
          occurredAt: planDate1,
          comment: "Focus on lower body power. Rest 3 min between squat sets.",
          createdBy: admin.id,
          updatedBy: admin.id,
        },
        {
          traineeId: morgan.id,
          name: "Upper Body Pull",
          occurredAt: planDate2,
          comment: "Upper body pull day. Control the negative on rows.",
          createdBy: admin.id,
          updatedBy: admin.id,
        },
      ])
      .returning({ id: workoutPlans.id });

    const [mP1Ex1, mP1Ex2, mP1Ex3, mP1Ex4] = await tx
      .insert(exercises)
      .values([
        {
          workoutPlanId: morganPlan1.id,
          name: "Back Squat",
          type: "reps",
          sets: 4,
          reps: 6,
          weightLbs: 185,
          comment: "Bar on traps, squat to parallel or below.",
          createdBy: admin.id,
          updatedBy: admin.id,
        },
        {
          workoutPlanId: morganPlan1.id,
          name: "Romanian Deadlift",
          type: "reps",
          sets: 3,
          reps: 10,
          weightLbs: 135,
          createdBy: admin.id,
          updatedBy: admin.id,
        },
        {
          workoutPlanId: morganPlan1.id,
          name: "Barbell Row",
          type: "reps",
          sets: 3,
          reps: 8,
          weightLbs: 115,
          createdBy: admin.id,
          updatedBy: admin.id,
        },
        {
          workoutPlanId: morganPlan1.id,
          name: "Plank Hold",
          type: "duration",
          sets: 3,
          durationSeconds: 60,
          comment: "Full tension throughout. No sagging hips.",
          createdBy: admin.id,
          updatedBy: admin.id,
        },
      ])
      .returning({ id: exercises.id });

    await tx.insert(exercises).values([
      {
        workoutPlanId: morganPlan2.id,
        name: "Pull-Ups",
        type: "reps",
        sets: 4,
        reps: 8,
        comment: "Full range of motion — dead hang to chin over bar.",
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      {
        workoutPlanId: morganPlan2.id,
        name: "Barbell Row",
        type: "reps",
        sets: 3,
        reps: 10,
        weightLbs: 105,
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      {
        workoutPlanId: morganPlan2.id,
        name: "Face Pulls",
        type: "reps",
        sets: 3,
        reps: 15,
        weightLbs: 30,
        createdBy: admin.id,
        updatedBy: admin.id,
      },
    ]);

    // ── Sam's workout plans ───────────────────────────────────────────────
    const [samPlan1] = await tx
      .insert(workoutPlans)
      .values([
        {
          traineeId: sam.id,
          name: "Push Day",
          occurredAt: planDate2,
          comment: "Push day — keep scapula retracted on press movements.",
          createdBy: admin.id,
          updatedBy: admin.id,
        },
      ])
      .returning({ id: workoutPlans.id });

    const [sP1Ex1, sP1Ex2, sP1Ex3] = await tx
      .insert(exercises)
      .values([
        {
          workoutPlanId: samPlan1.id,
          name: "Bench Press",
          type: "reps",
          sets: 4,
          reps: 5,
          weightLbs: 155,
          createdBy: admin.id,
          updatedBy: admin.id,
        },
        {
          workoutPlanId: samPlan1.id,
          name: "Overhead Press",
          type: "reps",
          sets: 3,
          reps: 8,
          weightLbs: 95,
          createdBy: admin.id,
          updatedBy: admin.id,
        },
        {
          workoutPlanId: samPlan1.id,
          name: "Lateral Raise Hold",
          type: "duration",
          sets: 3,
          durationSeconds: 30,
          weightLbs: 10,
          comment: "Raise to shoulder height, hold for duration.",
          createdBy: admin.id,
          updatedBy: admin.id,
        },
      ])
      .returning({ id: exercises.id });

    // ── Completed workouts (history) ──────────────────────────────────────
    const [morganWorkout] = await tx
      .insert(workouts)
      .values({
        traineeId: morgan.id,
        workoutPlanId: morganPlan1.id,
        durationSeconds: 3120, // 52 minutes
        painRating: 2,
        energyRating: 8,
        comment: "Felt strong today. Hit all sets on squats at 185lbs.",
        createdBy: morgan.id,
        updatedBy: morgan.id,
      })
      .returning({ id: workouts.id });

    await tx.insert(workoutExercises).values([
      {
        workoutId: morganWorkout.id, exerciseId: mP1Ex1.id, createdBy: morgan.id, updatedBy: morgan.id,
        setsData: [
          { reps: 6, weightLbs: 185, completed: true },
          { reps: 6, weightLbs: 185, completed: true },
          { reps: 6, weightLbs: 185, completed: true },
          { reps: 5, weightLbs: 185, completed: true },
        ],
      },
      {
        workoutId: morganWorkout.id, exerciseId: mP1Ex2.id, createdBy: morgan.id, updatedBy: morgan.id,
        setsData: [
          { reps: 10, weightLbs: 135, completed: true },
          { reps: 10, weightLbs: 135, completed: true },
          { reps: 8, weightLbs: 135, completed: true },
        ],
      },
      {
        workoutId: morganWorkout.id, exerciseId: mP1Ex3.id, createdBy: morgan.id, updatedBy: morgan.id,
        setsData: [
          { reps: 8, weightLbs: 115, completed: true },
          { reps: 8, weightLbs: 115, completed: true },
          { reps: 7, weightLbs: 115, completed: true },
        ],
      },
      {
        workoutId: morganWorkout.id, exerciseId: mP1Ex4.id, createdBy: morgan.id, updatedBy: morgan.id,
        setsData: [
          { durationSeconds: 60, completed: true },
          { durationSeconds: 60, completed: true },
          { durationSeconds: 45, completed: true },
        ],
      },
    ]);

    const [samWorkout] = await tx
      .insert(workouts)
      .values({
        traineeId: sam.id,
        workoutPlanId: samPlan1.id,
        durationSeconds: 2700, // 45 minutes
        painRating: 1,
        energyRating: 9,
        comment: "PR on bench today! Hit 155x5.",
        createdBy: sam.id,
        updatedBy: sam.id,
      })
      .returning({ id: workouts.id });

    await tx.insert(workoutExercises).values([
      {
        workoutId: samWorkout.id, exerciseId: sP1Ex1.id, createdBy: sam.id, updatedBy: sam.id,
        setsData: [
          { reps: 5, weightLbs: 155, completed: true },
          { reps: 5, weightLbs: 155, completed: true },
          { reps: 5, weightLbs: 155, completed: true },
          { reps: 5, weightLbs: 155, completed: true },
        ],
      },
      {
        workoutId: samWorkout.id, exerciseId: sP1Ex2.id, createdBy: sam.id, updatedBy: sam.id,
        setsData: [
          { reps: 8, weightLbs: 95, completed: true },
          { reps: 8, weightLbs: 95, completed: true },
          { reps: 7, weightLbs: 95, completed: true },
        ],
      },
      {
        workoutId: samWorkout.id, exerciseId: sP1Ex3.id, createdBy: sam.id, updatedBy: sam.id,
        setsData: [
          { durationSeconds: 30, weightLbs: 10, completed: true },
          { durationSeconds: 30, weightLbs: 10, completed: true },
          { durationSeconds: 25, weightLbs: 10, completed: true },
        ],
      },
    ]);
  });

  console.log(
    "Seeded: 3 users (1 admin + 2 trainees), 3 roles, 2 trainer assignments, 3 workout plans (2 for Morgan, 1 for Sam), 10 exercises, 2 completed workouts.",
  );
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => client.end());
