import { and, desc, eq, isNull, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  exercises,
  workoutPlanGroups,
  workoutPlans,
} from "@/db/schema";

import { type ExerciseInput, insertExercises } from "./workout-plans";

export async function listWorkoutPlanGroupsForTrainee(traineeId: string) {
  return db.query.workoutPlanGroups.findMany({
    where: and(
      eq(workoutPlanGroups.traineeId, traineeId),
      isNull(workoutPlanGroups.deletedAt),
    ),
    orderBy: [desc(workoutPlanGroups.createdAt)],
    with: {
      currentVersion: {
        columns: {
          id: true,
          name: true,
          versionStatus: true,
          versionNumber: true,
          publishedAt: true,
        },
      },
    },
  });
}

export async function getWorkoutPlanGroup(groupId: string) {
  return db.query.workoutPlanGroups.findFirst({
    where: and(eq(workoutPlanGroups.id, groupId), isNull(workoutPlanGroups.deletedAt)),
    with: {
      versions: {
        orderBy: [desc(workoutPlans.versionNumber)],
        with: {
          exercises: {
            where: isNull(exercises.deletedAt),
            orderBy: [exercises.position],
          },
        },
      },
    },
  });
}

// Soft-deletes a group and all its plans (draft, published, or archived).
export async function softDeletePlanGroup(groupId: string, deletedBy: string) {
  await db.transaction(async (tx) => {
    const now = new Date();

    await tx
      .update(workoutPlans)
      .set({ deletedAt: now, updatedBy: deletedBy })
      .where(
        and(
          eq(workoutPlans.workoutPlanGroupId, groupId),
          isNull(workoutPlans.deletedAt),
        ),
      );

    await tx
      .update(workoutPlanGroups)
      .set({ deletedAt: now, updatedBy: deletedBy })
      .where(eq(workoutPlanGroups.id, groupId));
  });
}

export async function updateWorkoutPlanGroupName({
  groupId,
  name,
  updatedBy,
}: {
  groupId: string;
  name: string;
  updatedBy: string;
}) {
  const [group] = await db
    .update(workoutPlanGroups)
    .set({ name, updatedBy })
    .where(eq(workoutPlanGroups.id, groupId))
    .returning();
  return group;
}

export async function publishNewVersion({
  groupId,
  name,
  comment,
  exerciseInputs,
  publishedBy,
}: {
  groupId: string;
  name: string;
  comment?: string | null;
  exerciseInputs: ExerciseInput[];
  publishedBy: string;
}) {
  return db.transaction(async (tx) => {
    // Lock the group row to prevent concurrent publishes.
    const [group] = await tx
      .select()
      .from(workoutPlanGroups)
      .where(eq(workoutPlanGroups.id, groupId))
      .for("update");

    if (!group) throw new Error("Group not found");

    // Determine the next version number.
    const [{ maxVersion }] = await tx
      .select({
        maxVersion: sql<number>`COALESCE(MAX(${workoutPlans.versionNumber}), 0)`,
      })
      .from(workoutPlans)
      .where(eq(workoutPlans.workoutPlanGroupId, groupId));

    const nextVersion = maxVersion + 1;

    // Insert the new published plan.
    const [newPlan] = await tx
      .insert(workoutPlans)
      .values({
        traineeId: group.traineeId,
        workoutPlanGroupId: groupId,
        name,
        comment: comment ?? null,
        versionStatus: "published",
        versionNumber: nextVersion,
        publishedAt: new Date(),
        createdBy: publishedBy,
        updatedBy: publishedBy,
      })
      .returning();

    await insertExercises(
      tx,
      newPlan.id,
      exerciseInputs.map((input, position) => ({ input, position })),
      publishedBy,
      group.traineeId,
    );

    // Archive the previously-current version and any remaining drafts in the
    // group. The newly inserted plan is "published" so it is unaffected by the
    // draft filter; the currentVersionId guard keeps the old published plan
    // archived too even if it was not a draft.
    await tx
      .update(workoutPlans)
      .set({ versionStatus: "archived", updatedBy: publishedBy })
      .where(
        and(
          eq(workoutPlans.workoutPlanGroupId, groupId),
          sql`${workoutPlans.versionStatus} IN ('draft', 'published')`,
          ne(workoutPlans.id, newPlan.id),
        ),
      );

    // Point the group at the new published version.
    await tx
      .update(workoutPlanGroups)
      .set({ currentVersionId: newPlan.id, updatedBy: publishedBy })
      .where(eq(workoutPlanGroups.id, groupId));

    return newPlan;
  });
}
