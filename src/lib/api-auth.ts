import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import type { CurrentUser } from "@/lib/auth";
import { decryptUserId } from "@/lib/client-token";
import { getSession } from "@/lib/session";

async function fetchUser(userId: string): Promise<CurrentUser | null> {
  const user = await db.query.users.findFirst({
    where: and(eq(users.id, userId), isNull(users.deletedAt)),
    with: { roles: true },
  });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles.map((r) => r.role),
  };
}

export async function getApiUser(request: Request): Promise<CurrentUser | null> {
  const auth = request.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) {
    const userId = decryptUserId(auth.slice(7));
    if (userId) return fetchUser(userId);
  }

  const session = await getSession();
  if (session?.userId) return fetchUser(session.userId);

  return null;
}
