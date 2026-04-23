import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userRoles, users, type UserRole } from "@/db/schema";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
};

// TODO(auth): replace with real session lookup. For now we resolve a single
// seeded user so route handlers and the UploadThing middleware share one
// integration point.
export async function getCurrentUser(): Promise<CurrentUser> {
  const email =
    process.env.STUB_CURRENT_USER_EMAIL ?? "kevin.a.cunanan@gmail.com";

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    with: { roles: true },
  });

  if (!user) {
    throw new Error(
      `Stub current user not found for email "${email}". Run \`npm run db:seed\` or set STUB_CURRENT_USER_EMAIL.`,
    );
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles.map((r) => r.role),
  };
}
