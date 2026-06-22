import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

process.env.SESSION_SECRET = "test-session-secret-with-enough-entropy-xyz";

const { mockFindFirst, mockCookies } = vi.hoisted(() => {
  const cookieStore = new Map<string, { value: string }>();
  return {
    mockFindFirst: vi.fn(),
    mockCookies: {
      store: cookieStore,
      get: vi.fn((name: string) => cookieStore.get(name)),
      set: vi.fn((name: string, value: string) => {
        cookieStore.set(name, { value });
      }),
      delete: vi.fn((name: string) => {
        cookieStore.delete(name);
      }),
    },
  };
});

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => mockCookies),
}));

vi.mock("@/db", () => ({
  db: {
    query: {
      users: {
        findFirst: mockFindFirst,
      },
    },
  },
}));

describe("client-session", () => {
  beforeAll(async () => {
    // Touch the module after env + mocks are wired so it sees them.
    await import("@/lib/client-session");
  });

  beforeEach(() => {
    mockCookies.store.clear();
    mockFindFirst.mockReset();
  });

  it("returns the session for a freshly minted cookie when the user has no pinUpdatedAt", async () => {
    const { createClientSession, getClientSession } = await import(
      "@/lib/client-session"
    );
    mockFindFirst.mockResolvedValue({ pinUpdatedAt: null });

    await createClientSession("user_abc");
    const session = await getClientSession();

    expect(session).toEqual({ traineeId: "user_abc" });
  });

  it("returns the session when pinUpdatedAt is in the same second as the JWT iat (regression: PIN-create immediately logs in)", async () => {
    const { createClientSession, getClientSession } = await import(
      "@/lib/client-session"
    );
    // Simulate the PIN-create flow: pinUpdatedAt set ~now (ms precision), then
    // a session minted within the same wall-clock second.
    const pinUpdatedAt = new Date(Date.now() + 250); // 250ms after "now"
    await createClientSession("user_abc");
    mockFindFirst.mockResolvedValue({ pinUpdatedAt });

    const session = await getClientSession();

    expect(session).toEqual({ traineeId: "user_abc" });
  });

  it("rejects a session when pinUpdatedAt is strictly after the JWT iat (real PIN reset)", async () => {
    const { createClientSession, getClientSession } = await import(
      "@/lib/client-session"
    );
    await createClientSession("user_abc");
    // Simulate a PIN reset several seconds after the session was issued.
    mockFindFirst.mockResolvedValue({
      pinUpdatedAt: new Date(Date.now() + 10_000),
    });

    const session = await getClientSession();

    expect(session).toBeNull();
  });

  it("returns null when no cookie is set", async () => {
    const { getClientSession } = await import("@/lib/client-session");
    const session = await getClientSession();
    expect(session).toBeNull();
  });

  it("returns null when the cookie is garbage", async () => {
    const { getClientSession } = await import("@/lib/client-session");
    mockCookies.store.set("client_session", { value: "not-a-real-jwt" });
    const session = await getClientSession();
    expect(session).toBeNull();
  });

  it("deleteClientSession removes the cookie", async () => {
    const { createClientSession, deleteClientSession, getClientSession } =
      await import("@/lib/client-session");
    mockFindFirst.mockResolvedValue({ pinUpdatedAt: null });

    await createClientSession("user_abc");
    expect(await getClientSession()).not.toBeNull();

    await deleteClientSession();
    expect(await getClientSession()).toBeNull();
  });
});
