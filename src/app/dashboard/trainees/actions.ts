"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { userRoles, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function createTrainee(data: { name: string; email: string }) {
  const currentUser = await getCurrentUser();

  const canAdd = currentUser.roles.some((r) =>
    (["admin", "trainer_manager", "trainer"] as const).includes(r as never),
  );
  if (!canAdd) throw new Error("Unauthorized");

  const email = data.email.toLowerCase().trim();
  const name = data.name.trim();

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) return { error: "A user with this email already exists." };

  await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(users)
      .values({ email, name })
      .returning({ id: users.id });

    await tx.insert(userRoles).values({ userId: created.id, role: "trainee" });
  });

  revalidatePath("/dashboard/trainees");
  return { success: true };
}
