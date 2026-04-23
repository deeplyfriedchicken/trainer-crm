import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { userRoles, users } from "@/db/schema";

export type ListTrainersOptions = {
  limit: number;
  offset: number;
};

const TRAINER_ROLES = ["trainer", "trainer_manager"] as const;

export async function listTrainers(options: ListTrainersOptions) {
  const trainerIds = db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .where(inArray(userRoles.role, [...TRAINER_ROLES]));

  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(inArray(users.id, trainerIds))
    .orderBy(asc(users.name))
    .limit(options.limit)
    .offset(options.offset);
}

export async function getTrainerById(id: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      roles: true,
      trainerAssignments: {
        with: {
          trainee: {
            columns: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  if (!user) return null;
  const hasTrainerRole = user.roles.some(
    (r) => r.role === "trainer" || r.role === "trainer_manager",
  );
  if (!hasTrainerRole) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    roles: user.roles.map((r) => r.role),
    trainerAssignments: user.trainerAssignments.map((ta) => ({
      assignmentId: ta.id,
      assignedAt: ta.assignedAt,
      trainee: ta.trainee,
    })),
  };
}
