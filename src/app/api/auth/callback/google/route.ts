import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/session";

const CRM_ROLES = new Set(["admin", "trainer_manager", "trainer"] as const);

function loginError(req: NextRequest, code: string) {
  return NextResponse.redirect(new URL(`/login?error=${code}`, req.nextUrl));
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // Verify CSRF state
  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  cookieStore.delete("oauth_state");

  if (!code || !state || state !== storedState) {
    return loginError(req, "invalid_state");
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.APP_URL}/api/auth/callback/google`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) return loginError(req, "token_exchange");

  const { access_token } = await tokenRes.json();

  // Get user profile from Google
  const profileRes = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    { headers: { Authorization: `Bearer ${access_token}` } },
  );

  if (!profileRes.ok) return loginError(req, "profile");

  const { email } = (await profileRes.json()) as { email: string };

  // Look up user — must exist and have a CRM role
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    with: { roles: true },
  });

  if (!user) return loginError(req, "not_found");

  const hasCRMRole = user.roles.some((r) => CRM_ROLES.has(r.role as never));
  if (!hasCRMRole) return loginError(req, "unauthorized");

  await createSession(user.id);
  return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
}
