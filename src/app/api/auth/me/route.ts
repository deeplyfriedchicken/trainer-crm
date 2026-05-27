import { getMobileUser } from "@/lib/mobile-auth";

// @invokes getMobileUser(request)
// @errors 401 unauthorized
export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({ data: user });
}
