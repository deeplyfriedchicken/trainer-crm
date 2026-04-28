import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

type ClientSessionPayload = { traineeId: string; expiresAt: number };

const COOKIE_NAME = "client_session";
const DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET env var is not set");
  return new TextEncoder().encode(secret);
}

export async function createClientSession(traineeId: string): Promise<void> {
  const expiresAt = Date.now() + DURATION_MS;
  const token = await new SignJWT({ traineeId, expiresAt } satisfies ClientSessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(key());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expiresAt),
    sameSite: "lax",
    path: "/",
  });
}

export async function getClientSession(): Promise<{ traineeId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<ClientSessionPayload>(token, key(), {
      algorithms: ["HS256"],
    });
    return { traineeId: payload.traineeId };
  } catch {
    return null;
  }
}

export async function deleteClientSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
