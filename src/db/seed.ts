import { sql } from "drizzle-orm";
import { client, db } from "@/db";
import {
  exercises,
  userRoles,
  users,
  workoutExercises,
  workoutPlanGroups,
  workoutPlans,
  workouts,
  workoutSets,
} from "@/db/schema";

async function seed() {
  await db.transaction(async (tx) => {
    await tx.execute(sql`
      TRUNCATE TABLE
        pain_flags,
        workout_tags,
        workout_sets,
        workout_videos,
        workout_exercises,
        workouts,
        workout_plan_videos,
        exercise_videos,
        exercises,
        workout_plan_groups,
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

    const [group] = await tx
      .insert(workoutPlanGroups)
      .values({
        traineeId: admin.id,
        name: "Full Body Strength",
        createdBy: admin.id,
        updatedBy: admin.id,
      })
      .returning({ id: workoutPlanGroups.id });

    const [plan] = await tx
      .insert(workoutPlans)
      .values({
        traineeId: admin.id,
        workoutPlanGroupId: group.id,
        name: "Full Body Strength",
        occurredAt: new Date("2026-04-01T09:00:00Z"),
        comment: "Foundational strength program",
        versionStatus: "published",
        versionNumber: 1,
        publishedAt: new Date("2026-04-01T09:00:00Z"),
        createdBy: admin.id,
        updatedBy: admin.id,
      })
      .returning({ id: workoutPlans.id });

    await tx
      .update(workoutPlanGroups)
      .set({ currentVersionId: plan.id })
      .where(sql`id = ${group.id}`);

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
          position: 0,
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
          position: 1,
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
          position: 2,
          createdBy: admin.id,
          updatedBy: admin.id,
        },
        {
          workoutPlanId: plan.id,
          name: "Pull-Ups",
          type: "reps",
          sets: 3,
          reps: 10,
          position: 3,
          createdBy: admin.id,
          updatedBy: admin.id,
        },
        {
          workoutPlanId: plan.id,
          name: "Plank Hold",
          type: "duration",
          sets: 3,
          durationSeconds: 60,
          position: 4,
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
          postSessionEnergy: 8,
          painRating: 2,
          comment: "Felt strong today, hit all sets.",
          createdBy: admin.id,
          updatedBy: admin.id,
        },
        {
          traineeId: admin.id,
          workoutPlanId: plan.id,
          durationSeconds: 3300,
          postSessionEnergy: 6,
          painRating: 3,
          comment: "A bit tired but pushed through.",
          createdBy: admin.id,
          updatedBy: admin.id,
        },
      ])
      .returning({ id: workouts.id });

    // Insert workout_exercises join rows (no sets_data — sets go to workout_sets now).
    await tx.insert(workoutExercises).values([
      { workoutId: workout1.id, exerciseId: squat.id, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout1.id, exerciseId: bench.id, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout1.id, exerciseId: deadlift.id, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout1.id, exerciseId: pullUp.id, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout1.id, exerciseId: plank.id, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout2.id, exerciseId: squat.id, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout2.id, exerciseId: bench.id, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout2.id, exerciseId: deadlift.id, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout2.id, exerciseId: pullUp.id, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout2.id, exerciseId: plank.id, createdBy: admin.id, updatedBy: admin.id },
    ]);

    await tx.insert(workoutSets).values([
      // workout1 sets
      { workoutId: workout1.id, exerciseId: squat.id, position: 0, reps: 8, weightLbs: 135, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout1.id, exerciseId: squat.id, position: 1, reps: 8, weightLbs: 135, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout1.id, exerciseId: squat.id, position: 2, reps: 8, weightLbs: 135, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout1.id, exerciseId: squat.id, position: 3, reps: 8, weightLbs: 135, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout1.id, exerciseId: bench.id, position: 0, reps: 8, weightLbs: 115, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout1.id, exerciseId: bench.id, position: 1, reps: 8, weightLbs: 115, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout1.id, exerciseId: bench.id, position: 2, reps: 8, weightLbs: 115, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout1.id, exerciseId: bench.id, position: 3, reps: 8, weightLbs: 115, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout1.id, exerciseId: deadlift.id, position: 0, reps: 5, weightLbs: 185, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout1.id, exerciseId: deadlift.id, position: 1, reps: 5, weightLbs: 185, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout1.id, exerciseId: deadlift.id, position: 2, reps: 5, weightLbs: 185, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout1.id, exerciseId: pullUp.id, position: 0, reps: 10, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout1.id, exerciseId: pullUp.id, position: 1, reps: 9, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout1.id, exerciseId: pullUp.id, position: 2, reps: 8, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout1.id, exerciseId: plank.id, position: 0, durationSeconds: 60, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout1.id, exerciseId: plank.id, position: 1, durationSeconds: 60, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout1.id, exerciseId: plank.id, position: 2, durationSeconds: 45, completed: true, createdBy: admin.id, updatedBy: admin.id },
      // workout2 sets
      { workoutId: workout2.id, exerciseId: squat.id, position: 0, reps: 8, weightLbs: 135, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout2.id, exerciseId: squat.id, position: 1, reps: 8, weightLbs: 135, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout2.id, exerciseId: squat.id, position: 2, reps: 7, weightLbs: 135, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout2.id, exerciseId: squat.id, position: 3, reps: 6, weightLbs: 135, completed: false, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout2.id, exerciseId: bench.id, position: 0, reps: 8, weightLbs: 115, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout2.id, exerciseId: bench.id, position: 1, reps: 8, weightLbs: 115, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout2.id, exerciseId: bench.id, position: 2, reps: 6, weightLbs: 115, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout2.id, exerciseId: bench.id, position: 3, reps: 5, weightLbs: 115, completed: false, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout2.id, exerciseId: deadlift.id, position: 0, reps: 5, weightLbs: 185, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout2.id, exerciseId: deadlift.id, position: 1, reps: 5, weightLbs: 185, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout2.id, exerciseId: deadlift.id, position: 2, reps: 4, weightLbs: 185, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout2.id, exerciseId: pullUp.id, position: 0, reps: 9, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout2.id, exerciseId: pullUp.id, position: 1, reps: 8, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout2.id, exerciseId: pullUp.id, position: 2, reps: 7, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout2.id, exerciseId: plank.id, position: 0, durationSeconds: 60, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout2.id, exerciseId: plank.id, position: 1, durationSeconds: 50, completed: true, createdBy: admin.id, updatedBy: admin.id },
      { workoutId: workout2.id, exerciseId: plank.id, position: 2, durationSeconds: 40, completed: false, createdBy: admin.id, updatedBy: admin.id },
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
