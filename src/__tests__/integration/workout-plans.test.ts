import { sql } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db";
import { updateWorkoutPlan } from "@/db/queries/workout-plans";
import {
  exercises,
  userRoles,
  users,
  workoutExercises,
  workoutPlans,
  workouts,
} from "@/db/schema";

async function seedUsers() {
  const [trainer] = await db
    .insert(users)
    .values({ email: `trainer-${Date.now()}@test.com`, name: "Trainer" })
    .returning();
  const [trainee] = await db
    .insert(users)
    .values({ email: `trainee-${Date.now()}@test.com`, name: "Trainee" })
    .returning();
  await db.insert(userRoles).values([
    { userId: trainer.id, role: "trainer" },
    { userId: trainee.id, role: "trainee" },
  ]);
  return { trainer, trainee };
}

// authorship columns are ON DELETE RESTRICT, so cascade-truncate is the only
// reliable way to clean up all tables between tests.
async function truncateAll() {
  await db.execute(
    sql`TRUNCATE users, user_roles, workout_plans, exercises, exercise_videos,
        workout_plan_videos, workouts, workout_exercises, workout_videos,
        videos, video_tags, tags, chats, messages RESTART IDENTITY CASCADE`,
  );
}

describe("updateWorkoutPlan — exercise history preservation", () => {
  let trainerId: string;
  let traineeId: string;

  beforeEach(async () => {
    const { trainer, trainee } = await seedUsers();
    trainerId = trainer.id;
    traineeId = trainee.id;
  });

  afterEach(truncateAll);

  it("preserves workout_exercises rows when updating exercises in place", async () => {
    // Create plan with one exercise
    const [plan] = await db
      .insert(workoutPlans)
      .values({
        traineeId,
        name: "Original Plan",
        occurredAt: new Date(),
        createdBy: trainerId,
        updatedBy: trainerId,
      })
      .returning();

    const [exercise] = await db
      .insert(exercises)
      .values({
        workoutPlanId: plan.id,
        name: "Squat",
        type: "reps",
        sets: 3,
        reps: 10,
        createdBy: trainerId,
        updatedBy: trainerId,
      })
      .returning();

    // Log a workout against this plan
    const [workout] = await db
      .insert(workouts)
      .values({
        traineeId,
        workoutPlanId: plan.id,
        durationSeconds: 3600,
        createdBy: traineeId,
        updatedBy: traineeId,
      })
      .returning();

    await db.insert(workoutExercises).values({
      workoutId: workout.id,
      exerciseId: exercise.id,
      createdBy: traineeId,
      updatedBy: traineeId,
    });

    // Update the plan — send the exercise back with its ID (trainer renamed it)
    await updateWorkoutPlan({
      planId: plan.id,
      name: "Updated Plan",
      occurredAt: new Date(),
      updatedBy: trainerId,
      exerciseInputs: [
        { id: exercise.id, name: "Back Squat", type: "reps", sets: 4, reps: 8 },
      ],
    });

    // workout_exercises row must still exist
    const links = await db
      .select()
      .from(workoutExercises)
      .where(eq(workoutExercises.workoutId, workout.id));
    expect(links).toHaveLength(1);
    expect(links[0].exerciseId).toBe(exercise.id);

    // Exercise row updated in place (same ID, new name)
    const [updatedEx] = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, exercise.id));
    expect(updatedEx.name).toBe("Back Squat");
    expect(updatedEx.deletedAt).toBeNull();
  });

  it("soft-deletes removed exercises and preserves their workout_exercises rows", async () => {
    const [plan] = await db
      .insert(workoutPlans)
      .values({
        traineeId,
        name: "Plan",
        occurredAt: new Date(),
        createdBy: trainerId,
        updatedBy: trainerId,
      })
      .returning();

    const [exA] = await db
      .insert(exercises)
      .values({
        workoutPlanId: plan.id,
        name: "Squat",
        type: "reps",
        sets: 3,
        reps: 10,
        createdBy: trainerId,
        updatedBy: trainerId,
      })
      .returning();

    const [exB] = await db
      .insert(exercises)
      .values({
        workoutPlanId: plan.id,
        name: "Lunge",
        type: "reps",
        sets: 3,
        reps: 12,
        createdBy: trainerId,
        updatedBy: trainerId,
      })
      .returning();

    // Log a workout that includes both exercises
    const [workout] = await db
      .insert(workouts)
      .values({
        traineeId,
        workoutPlanId: plan.id,
        durationSeconds: 1800,
        createdBy: traineeId,
        updatedBy: traineeId,
      })
      .returning();

    await db.insert(workoutExercises).values([
      { workoutId: workout.id, exerciseId: exA.id, createdBy: traineeId, updatedBy: traineeId },
      { workoutId: workout.id, exerciseId: exB.id, createdBy: traineeId, updatedBy: traineeId },
    ]);

    // Update plan — remove exB (only send exA with its ID)
    await updateWorkoutPlan({
      planId: plan.id,
      name: "Plan",
      occurredAt: new Date(),
      updatedBy: trainerId,
      exerciseInputs: [
        { id: exA.id, name: "Squat", type: "reps", sets: 3, reps: 10 },
      ],
    });

    // exB must be soft-deleted, not hard-deleted
    const [removedEx] = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, exB.id));
    expect(removedEx).toBeDefined();
    expect(removedEx.deletedAt).not.toBeNull();

    // workout_exercises for exB must still exist (history preserved)
    const allLinks = await db
      .select()
      .from(workoutExercises)
      .where(eq(workoutExercises.workoutId, workout.id));
    expect(allLinks).toHaveLength(2);
    expect(allLinks.map((l) => l.exerciseId)).toContain(exB.id);
  });

  it("soft-deleting a workout plan preserves exercises and workout_exercises", async () => {
    const [plan] = await db
      .insert(workoutPlans)
      .values({
        traineeId,
        name: "Plan",
        occurredAt: new Date(),
        createdBy: trainerId,
        updatedBy: trainerId,
      })
      .returning();

    const [exercise] = await db
      .insert(exercises)
      .values({
        workoutPlanId: plan.id,
        name: "Deadlift",
        type: "reps",
        sets: 3,
        reps: 5,
        createdBy: trainerId,
        updatedBy: trainerId,
      })
      .returning();

    const [workout] = await db
      .insert(workouts)
      .values({
        traineeId,
        workoutPlanId: plan.id,
        durationSeconds: 2700,
        createdBy: traineeId,
        updatedBy: traineeId,
      })
      .returning();

    await db.insert(workoutExercises).values({
      workoutId: workout.id,
      exerciseId: exercise.id,
      createdBy: traineeId,
      updatedBy: traineeId,
    });

    // Soft-delete the plan
    await db
      .update(workoutPlans)
      .set({ deletedAt: new Date() })
      .where(eq(workoutPlans.id, plan.id));

    // Plan is soft-deleted
    const [softDeletedPlan] = await db
      .select()
      .from(workoutPlans)
      .where(eq(workoutPlans.id, plan.id));
    expect(softDeletedPlan.deletedAt).not.toBeNull();

    // Exercise still exists (not cascade-deleted)
    const [stillExists] = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, exercise.id));
    expect(stillExists).toBeDefined();
    expect(stillExists.deletedAt).toBeNull();

    // workout_exercises still exists
    const links = await db
      .select()
      .from(workoutExercises)
      .where(eq(workoutExercises.workoutId, workout.id));
    expect(links).toHaveLength(1);
  });
});
