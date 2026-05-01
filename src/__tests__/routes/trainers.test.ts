import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/trainers/route";
import { GET as GET_BY_ID, PATCH, DELETE } from "@/app/api/trainers/[id]/route";

const {
  mockGetRequestUser,
  mockListTrainers,
  mockCreateTrainer,
  mockGetTrainerById,
  mockUpdateTrainer,
  mockDeleteTrainer,
} = vi.hoisted(() => ({
  mockGetRequestUser: vi.fn(),
  mockListTrainers: vi.fn(),
  mockCreateTrainer: vi.fn(),
  mockGetTrainerById: vi.fn(),
  mockUpdateTrainer: vi.fn(),
  mockDeleteTrainer: vi.fn(),
}));

vi.mock("@/lib/request-auth", () => ({
  getRequestUser: mockGetRequestUser,
}));

vi.mock("@/db/queries/trainers", () => ({
  listTrainers: mockListTrainers,
  createTrainer: mockCreateTrainer,
  getTrainerById: mockGetTrainerById,
  updateTrainer: mockUpdateTrainer,
  deleteTrainer: mockDeleteTrainer,
}));

function nextRequest({
  url = "http://localhost:3000/api/trainers",
  method = "GET",
  body,
}: {
  url?: string;
  method?: string;
  body?: object;
} = {}) {
  return {
    nextUrl: new URL(url),
    json: vi.fn().mockResolvedValue(body),
    headers: new Headers(),
    method,
  } as unknown as Request;
}

function dynamicCtx(id: string) {
  return { params: Promise.resolve({ id }) };
}

const adminUser = {
  id: "admin_1",
  email: "admin@example.com",
  name: "Admin",
  roles: ["admin"],
};

const trainerManager = {
  id: "tm_1",
  email: "tm@example.com",
  name: "Trainer Manager",
  roles: ["trainer_manager"],
};

const trainerUser = {
  id: "trainer_1",
  email: "trainer@example.com",
  name: "Trainer",
  roles: ["trainer"],
};

const mockTrainer = {
  id: "trainer_2",
  email: "newtrainer@example.com",
  name: "New Trainer",
  roles: ["trainer"],
  videoCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("GET /api/trainers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetRequestUser.mockResolvedValue(null);
    const req = nextRequest();
    const res = await GET(req as never);
    expect(res.status).toBe(401);
  });

  it("returns 200 with paginated trainer list", async () => {
    mockGetRequestUser.mockResolvedValue(adminUser);
    mockListTrainers.mockResolvedValue([mockTrainer]);
    const req = nextRequest({ url: "http://localhost:3000/api/trainers?limit=10&offset=0" });
    const res = await GET(req as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe("trainer_2");
    expect(body.data[0].name).toBe("New Trainer");
    expect(body.data[0].roles).toEqual(["trainer"]);
    expect(body.pagination).toEqual({ limit: 10, offset: 0 });
  });

  it("calls listTrainers with parsed pagination params", async () => {
    mockGetRequestUser.mockResolvedValue(adminUser);
    mockListTrainers.mockResolvedValue([]);
    const req = nextRequest({ url: "http://localhost:3000/api/trainers?limit=50&offset=100" });
    await GET(req as never);
    expect(mockListTrainers).toHaveBeenCalledWith({ limit: 50, offset: 100 });
  });
});

describe("POST /api/trainers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetRequestUser.mockResolvedValue(null);
    const req = nextRequest({ method: "POST", body: { name: "T", email: "t@t.com" } });
    const res = await POST(req as never);
    expect(res.status).toBe(401);
  });

  it("returns 403 when user lacks admin/trainer_manager role", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    const req = nextRequest({ method: "POST", body: { name: "T", email: "t@t.com" } });
    const res = await POST(req as never);
    expect(res.status).toBe(403);
  });

  it("returns 400 when name is missing", async () => {
    mockGetRequestUser.mockResolvedValue(adminUser);
    const req = nextRequest({ method: "POST", body: { email: "t@t.com" } });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is missing", async () => {
    mockGetRequestUser.mockResolvedValue(adminUser);
    const req = nextRequest({ method: "POST", body: { name: "T" } });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it("returns 201 with created trainer (trainer role default)", async () => {
    mockGetRequestUser.mockResolvedValue(adminUser);
    mockCreateTrainer.mockResolvedValue(mockTrainer);
    const req = nextRequest({ method: "POST", body: { name: "New T", email: "new@example.com" } });
    const res = await POST(req as never);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.id).toBe("trainer_2");
    expect(body.data.name).toBe("New Trainer");
    expect(body.data.roles).toEqual(["trainer"]);
    expect(mockCreateTrainer).toHaveBeenCalledWith({
      name: "New T",
      email: "new@example.com",
      role: "trainer",
    });
  });

  it("returns 201 with created trainer (trainer_manager role)", async () => {
    mockGetRequestUser.mockResolvedValue(trainerManager);
    mockCreateTrainer.mockResolvedValue({ ...mockTrainer, roles: ["trainer_manager"] });
    const req = nextRequest({
      method: "POST",
      body: { name: "Manager", email: "manager@example.com", role: "trainer_manager" },
    });
    const res = await POST(req as never);
    expect(res.status).toBe(201);
    expect(mockCreateTrainer).toHaveBeenCalledWith({
      name: "Manager",
      email: "manager@example.com",
      role: "trainer_manager",
    });
  });
});

describe("GET /api/trainers/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetRequestUser.mockResolvedValue(null);
    const req = nextRequest();
    const res = await GET_BY_ID(req as never, dynamicCtx("trainer_2"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when trainer not found", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    mockGetTrainerById.mockResolvedValue(null);
    const req = nextRequest();
    const res = await GET_BY_ID(req as never, dynamicCtx("nonexistent"));
    expect(res.status).toBe(404);
  });

  it("returns 200 with trainer data", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    mockGetTrainerById.mockResolvedValue(mockTrainer);
    const req = nextRequest();
    const res = await GET_BY_ID(req as never, dynamicCtx("trainer_2"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe("trainer_2");
    expect(body.data.name).toBe("New Trainer");
    expect(body.data.roles).toEqual(["trainer"]);
  });
});

describe("PATCH /api/trainers/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetRequestUser.mockResolvedValue(null);
    const req = nextRequest({ method: "PATCH", body: { name: "Updated" } });
    const res = await PATCH(req as never, dynamicCtx("trainer_2"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when trainer not found", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    mockUpdateTrainer.mockResolvedValue(null);
    const req = nextRequest({ method: "PATCH", body: { name: "Updated" } });
    const res = await PATCH(req as never, dynamicCtx("nonexistent"));
    expect(res.status).toBe(404);
  });

  it("returns 200 with updated trainer", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    const updated = { ...mockTrainer, name: "Updated Name" };
    mockUpdateTrainer.mockResolvedValue(updated);
    const req = nextRequest({ method: "PATCH", body: { name: "Updated Name" } });
    const res = await PATCH(req as never, dynamicCtx("trainer_2"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe("Updated Name");
  });

  it("passes role as trainer_manager when specified", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    const updated = { ...mockTrainer, roles: ["trainer_manager"] };
    mockUpdateTrainer.mockResolvedValue(updated);
    const req = nextRequest({
      method: "PATCH",
      body: { name: "Promoted", role: "trainer_manager" },
    });
    await PATCH(req as never, dynamicCtx("trainer_2"));
    expect(mockUpdateTrainer).toHaveBeenCalledWith("trainer_2", {
      name: "Promoted",
      email: undefined,
      role: "trainer_manager",
    });
  });

  it("passes role as trainer when specified", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    mockUpdateTrainer.mockResolvedValue(mockTrainer);
    const req = nextRequest({
      method: "PATCH",
      body: { role: "trainer" },
    });
    await PATCH(req as never, dynamicCtx("trainer_2"));
    expect(mockUpdateTrainer).toHaveBeenCalledWith("trainer_2", {
      name: undefined,
      email: undefined,
      role: "trainer",
    });
  });
});

describe("DELETE /api/trainers/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetRequestUser.mockResolvedValue(null);
    const req = nextRequest();
    const res = await DELETE(req as never, dynamicCtx("trainer_2"));
    expect(res.status).toBe(401);
  });

  it("returns 403 when user lacks admin/trainer_manager role", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    const req = nextRequest();
    const res = await DELETE(req as never, dynamicCtx("trainer_2"));
    expect(res.status).toBe(403);
  });

  it("returns 204 on successful deletion (admin)", async () => {
    mockGetRequestUser.mockResolvedValue(adminUser);
    mockDeleteTrainer.mockResolvedValue(undefined);
    const req = nextRequest();
    const res = await DELETE(req as never, dynamicCtx("trainer_2"));
    expect(res.status).toBe(204);
    expect(mockDeleteTrainer).toHaveBeenCalledWith("trainer_2");
  });
});
