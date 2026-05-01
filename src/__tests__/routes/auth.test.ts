import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/auth/me/route";

const { mockGetMobileUser } = vi.hoisted(() => ({
  mockGetMobileUser: vi.fn(),
}));

vi.mock("@/lib/mobile-auth", () => ({
  getMobileUser: mockGetMobileUser,
}));

function mockRequest(headers?: Record<string, string>) {
  return new Request("http://localhost:3000/api/auth/me", { headers });
}

const mockUser = {
  id: "user_1",
  email: "trainer@example.com",
  name: "Test Trainer",
  roles: ["trainer"],
};

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 and user data when authenticated", async () => {
    mockGetMobileUser.mockResolvedValue(mockUser);
    const req = mockRequest({ Authorization: "Bearer valid-token" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(mockUser);
  });

  it("returns 401 when no auth header is present", async () => {
    mockGetMobileUser.mockResolvedValue(null);
    const req = mockRequest();
    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 401 when token is invalid", async () => {
    mockGetMobileUser.mockResolvedValue(null);
    const req = mockRequest({ Authorization: "Bearer invalid-token" });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
