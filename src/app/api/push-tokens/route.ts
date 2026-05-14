import type { NextRequest } from "next/server";
import { deletePushToken, upsertPushToken } from "@/db/queries/push";
import { getRequestUser } from "@/lib/request-auth";

// @body { token: string, platform: 'ios' | 'android' }
// @errors 400 missing fields | 401 unauthorized
export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    token?: string;
    platform?: string;
  };

  if (!body.token?.trim() || !body.platform?.trim()) {
    return Response.json(
      { error: "token and platform are required" },
      { status: 400 },
    );
  }

  const platform = body.platform as "ios" | "android";
  if (platform !== "ios" && platform !== "android") {
    return Response.json(
      { error: "platform must be ios or android" },
      { status: 400 },
    );
  }

  await upsertPushToken(user.id, body.token.trim(), platform);
  return Response.json({ ok: true });
}

// @body { token: string }
// @errors 400 missing token | 401 unauthorized
export async function DELETE(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { token?: string };
  if (!body.token?.trim()) {
    return Response.json({ error: "token is required" }, { status: 400 });
  }

  await deletePushToken(body.token.trim());
  return Response.json({ ok: true });
}
