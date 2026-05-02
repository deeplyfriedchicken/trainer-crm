import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import type { CurrentUser } from "@/lib/auth";
import { decryptUserId } from "@/lib/client-token";
import { getSession } from "@/lib/session";

async function userFromId(userId: string): Promise<CurrentUser | null> {
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

/**
 * Authenticates a route handler request via Bearer token (mobile) OR
 * cookie session (web dashboard), whichever is present.
 * Returns null if neither is valid.
 */
export async function getRequestUser(
  request: Request,
): Promise<CurrentUser | null> {
  // Mobile: Bearer token
  const auth = request.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) {
    const userId = decryptUserId(auth.slice(7));
    if (userId) return userFromId(userId);
  }

  // Web: cookie session
  const session = await getSession();
  if (session?.userId) return userFromId(session.userId);

  return null;
}
