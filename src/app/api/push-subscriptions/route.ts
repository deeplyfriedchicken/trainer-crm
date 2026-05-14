import type { NextRequest } from "next/server";
import {
  deletePushSubscription,
  upsertPushSubscription,
} from "@/db/queries/push";
import { getRequestUser } from "@/lib/request-auth";

// @body { endpoint: string, p256dh: string, auth: string }
// @errors 400 missing fields | 401 unauthorized
export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    endpoint?: string;
    p256dh?: string;
    auth?: string;
  };

  if (!body.endpoint?.trim() || !body.p256dh?.trim() || !body.auth?.trim()) {
    return Response.json(
      { error: "endpoint, p256dh, and auth are required" },
      { status: 400 },
    );
  }

  await upsertPushSubscription(
    user.id,
    body.endpoint.trim(),
    body.p256dh.trim(),
    body.auth.trim(),
  );
  return Response.json({ ok: true });
}

// @body { endpoint: string }
// @errors 400 missing endpoint | 401 unauthorized
export async function DELETE(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { endpoint?: string };
  if (!body.endpoint?.trim()) {
    return Response.json({ error: "endpoint is required" }, { status: 400 });
  }

  await deletePushSubscription(body.endpoint.trim());
  return Response.json({ ok: true });
}
