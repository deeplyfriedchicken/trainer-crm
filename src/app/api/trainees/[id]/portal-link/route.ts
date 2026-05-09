import type { NextRequest } from "next/server";
import { getTraineeById } from "@/db/queries/trainees";
import { encryptUserId } from "@/lib/client-token";
import { getRequestUser } from "@/lib/request-auth";

const ALLOWED_ROLES = new Set(["admin", "trainer_manager", "trainer"] as const);
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// @invokes getTraineeById(id), encryptUserId(trainee.id)
// @errors 401 unauthorized | 403 forbidden | 404 trainee not found
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!user.roles.some((r) => ALLOWED_ROLES.has(r as never))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const trainee = await getTraineeById(id);
  if (!trainee)
    return Response.json({ error: "Trainee not found" }, { status: 404 });

  const token = encryptUserId(trainee.id);
  const baseUrl = process.env.CLIENT_PORTAL_BASE_URL;
  const url = `${baseUrl}/client/${token}`;
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

  return Response.json({ data: { url, expiresAt } });
}
