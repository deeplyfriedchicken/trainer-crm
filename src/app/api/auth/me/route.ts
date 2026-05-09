import type { NextRequest } from "next/server";
import { getMobileUser } from "@/lib/mobile-auth";

// @invokes getMobileUser(request)
// @errors 401 unauthorized
export async function GET(request: NextRequest) {
  const user = await getMobileUser(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({ data: user });
}
