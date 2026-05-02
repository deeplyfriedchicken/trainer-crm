import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { type UserRole, users } from "@/db/schema";
import { getSession } from "@/lib/session";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
};

export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await db.query.users.findFirst({
    where: and(eq(users.id, session.userId), isNull(users.deletedAt)),
    with: { roles: true },
  });

  if (!user) redirect("/login");

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles.map((r) => r.role),
  };
});
