import { sql } from "drizzle-orm";
import { client, db } from "@/db";
import {
  exercises,
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
        user_roles,
        users
      RESTART IDENTITY CASCADE
    `);

    const [admin, ming] = await tx
      .insert(users)
      .values([
        { email: "kevin.a.cunanan@gmail.com", name: "Kevin Cunanan" },
        { email: "iming.shieh@gmail.com", name: "Iming Shieh" },
      ])
      .returning({ id: users.id });

    await tx.insert(userRoles).values([
      { userId: admin.id, role: "admin" },
      { userId: ming.id, role: "trainer_manager" },
    ]);

    const [plan] = await tx
      .insert(workoutPlans)
      .values({
        traineeId: admin.id,
        name: "Full Body Strength",
        occurredAt: new Date("2026-04-01T09:00:00Z"),
        comment: "Foundational strength program",
        createdBy: admin.id,
        updatedBy: admin.id,
      })
      .returning({ id: workoutPlans.id });

    const insertedExercises = await tx
      .insert(exercises)
      .values([
        {
          workoutPlanId: plan.id,
          name: "Barbell Back Squat",
          type: "reps",
          sets: 4,
          reps: 8,
          weightLbs: 135,
          createdBy: admin.id,
          updatedBy: admin.id,
        },
        {
          workoutPlanId: plan.id,
          name: "Bench Press",
          type: "reps",
          sets: 4,
          reps: 8,
          weightLbs: 115,
          createdBy: admin.id,
          updatedBy: admin.id,
        },
        {
          workoutPlanId: plan.id,
          name: "Deadlift",
          type: "reps",
          sets: 3,
          reps: 5,
          weightLbs: 185,
          createdBy: admin.id,
          updatedBy: admin.id,
        },
        {
          workoutPlanId: plan.id,
          name: "Pull-Ups",
          type: "reps",
          sets: 3,
          reps: 10,
          createdBy: admin.id,
          updatedBy: admin.id,
        },
        {
          workoutPlanId: plan.id,
          name: "Plank Hold",
          type: "duration",
          sets: 3,
          durationSeconds: 60,
          createdBy: admin.id,
          updatedBy: admin.id,
        },
      ])
      .returning({ id: exercises.id });

    const [squat, bench, deadlift, pullUp, plank] = insertedExercises;

    const [workout1, workout2] = await tx
      .insert(workouts)
      .values([
        {
          traineeId: admin.id,
          workoutPlanId: plan.id,
          durationSeconds: 3600,
          energyRating: 8,
          painRating: 2,
          comment: "Felt strong today, hit all sets.",
          createdBy: admin.id,
          updatedBy: admin.id,
        },
        {
          traineeId: admin.id,
          workoutPlanId: plan.id,
          durationSeconds: 3300,
          energyRating: 6,
          painRating: 3,
          comment: "A bit tired but pushed through.",
          createdBy: admin.id,
          updatedBy: admin.id,
        },
      ])
      .returning({ id: workouts.id });

    await tx.insert(workoutExercises).values([
      {
        workoutId: workout1.id,
        exerciseId: squat.id,
        setsData: [
          { reps: 8, weightLbs: 135, completed: true },
          { reps: 8, weightLbs: 135, completed: true },
          { reps: 8, weightLbs: 135, completed: true },
          { reps: 8, weightLbs: 135, completed: true },
        ],
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      {
        workoutId: workout1.id,
        exerciseId: bench.id,
        setsData: [
          { reps: 8, weightLbs: 115, completed: true },
          { reps: 8, weightLbs: 115, completed: true },
          { reps: 8, weightLbs: 115, completed: true },
          { reps: 8, weightLbs: 115, completed: true },
        ],
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      {
        workoutId: workout1.id,
        exerciseId: deadlift.id,
        setsData: [
          { reps: 5, weightLbs: 185, completed: true },
          { reps: 5, weightLbs: 185, completed: true },
          { reps: 5, weightLbs: 185, completed: true },
        ],
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      {
        workoutId: workout1.id,
        exerciseId: pullUp.id,
        setsData: [
          { reps: 10, completed: true },
          { reps: 9, completed: true },
          { reps: 8, completed: true },
        ],
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      {
        workoutId: workout1.id,
        exerciseId: plank.id,
        setsData: [
          { durationSeconds: 60, completed: true },
          { durationSeconds: 60, completed: true },
          { durationSeconds: 45, completed: true },
        ],
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      {
        workoutId: workout2.id,
        exerciseId: squat.id,
        setsData: [
          { reps: 8, weightLbs: 135, completed: true },
          { reps: 8, weightLbs: 135, completed: true },
          { reps: 7, weightLbs: 135, completed: true },
          { reps: 6, weightLbs: 135, completed: false },
        ],
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      {
        workoutId: workout2.id,
        exerciseId: bench.id,
        setsData: [
          { reps: 8, weightLbs: 115, completed: true },
          { reps: 8, weightLbs: 115, completed: true },
          { reps: 6, weightLbs: 115, completed: true },
          { reps: 5, weightLbs: 115, completed: false },
        ],
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      {
        workoutId: workout2.id,
        exerciseId: deadlift.id,
        setsData: [
          { reps: 5, weightLbs: 185, completed: true },
          { reps: 5, weightLbs: 185, completed: true },
          { reps: 4, weightLbs: 185, completed: true },
        ],
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      {
        workoutId: workout2.id,
        exerciseId: pullUp.id,
        setsData: [
          { reps: 9, completed: true },
          { reps: 8, completed: true },
          { reps: 7, completed: true },
        ],
        createdBy: admin.id,
        updatedBy: admin.id,
      },
      {
        workoutId: workout2.id,
        exerciseId: plank.id,
        setsData: [
          { durationSeconds: 60, completed: true },
          { durationSeconds: 50, completed: true },
          { durationSeconds: 40, completed: false },
        ],
        createdBy: admin.id,
        updatedBy: admin.id,
      },
    ]);
  });

  console.log(
    "Seeded: 2 users (1 admin + 1 trainer_manager), 1 workout plan (5 exercises) for Kevin, 2 completed workouts.",
  );
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => client.end());
