import { asc, count, eq, inArray, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@/db";
import { userRoles, users, videos } from "@/db/schema";
import type { UserRole } from "@/db/schema";

export type ListTrainersOptions = {
  limit: number;
  offset: number;
};

export async function listTrainers(options: ListTrainersOptions) {
  const trainerIds = db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .where(sql`${userRoles.role} in ('trainer', 'trainer_manager')`);

  const rows = await db
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

  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);

  const videoCounts = await db
    .select({
      uploaderId: videos.uploaderId,
      count: count(videos.id),
    })
    .from(videos)
    .where(inArray(videos.uploaderId, ids))
    .groupBy(videos.uploaderId);

  const videoCountMap = new Map(videoCounts.map((r) => [r.uploaderId, r.count]));

  return rows.map((r) => ({
    ...r,
    videoCount: videoCountMap.get(r.id) ?? 0,
  }));
}

export async function getTrainerById(id: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    with: { roles: true },
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
  };
}

export async function createTrainer({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: Extract<UserRole, "trainer" | "trainer_manager">;
}) {
  return db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ id: createId(), name, email })
      .returning();
    await tx.insert(userRoles).values({ userId: user.id, role });
    return { ...user, roles: [role] };
  });
}

export async function updateTrainer(
  id: string,
  {
    name,
    email,
    role,
  }: {
    name?: string;
    email?: string;
    role?: Extract<UserRole, "trainer" | "trainer_manager">;
  },
) {
  return db.transaction(async (tx) => {
    const [user] = await tx
      .update(users)
      .set({ ...(name !== undefined && { name }), ...(email !== undefined && { email }) })
      .where(eq(users.id, id))
      .returning();

    if (!user) return null;

    if (role !== undefined) {
      await tx
        .delete(userRoles)
        .where(
          sql`${userRoles.userId} = ${id} AND ${userRoles.role} IN ('trainer', 'trainer_manager')`,
        );
      await tx.insert(userRoles).values({ userId: id, role });
    }

    const updatedUser = await tx.query.users.findFirst({
      where: eq(users.id, id),
      with: { roles: true },
    });

    return updatedUser
      ? { ...updatedUser, roles: updatedUser.roles.map((r) => r.role) }
      : null;
  });
}

export async function deleteTrainer(id: string) {
  await db.delete(users).where(eq(users.id, id));
}
