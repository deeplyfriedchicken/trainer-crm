import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/trainees/route";
import { GET as GET_BY_ID, PATCH, DELETE } from "@/app/api/trainees/[id]/route";

const {
  mockGetRequestUser,
  mockListTrainees,
  mockCreateTrainee,
  mockGetTraineeById,
  mockUpdateTrainee,
  mockDeleteTrainee,
} = vi.hoisted(() => ({
  mockGetRequestUser: vi.fn(),
  mockListTrainees: vi.fn(),
  mockCreateTrainee: vi.fn(),
  mockGetTraineeById: vi.fn(),
  mockUpdateTrainee: vi.fn(),
  mockDeleteTrainee: vi.fn(),
}));

vi.mock("@/lib/request-auth", () => ({
  getRequestUser: mockGetRequestUser,
}));

vi.mock("@/db/queries/trainees", () => ({
  listTrainees: mockListTrainees,
  createTrainee: mockCreateTrainee,
  getTraineeById: mockGetTraineeById,
  updateTrainee: mockUpdateTrainee,
  deleteTrainee: mockDeleteTrainee,
}));

function nextRequest({
  url = "http://localhost:3000/api/trainees",
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

const mockTrainee = {
  id: "trainee_1",
  email: "trainee@example.com",
  name: "Test Trainee",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("GET /api/trainees", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetRequestUser.mockResolvedValue(null);
    const req = nextRequest();
    const res = await GET(req as never);
    expect(res.status).toBe(401);
  });

  it("returns 200 with paginated trainee list", async () => {
    mockGetRequestUser.mockResolvedValue(adminUser);
    mockListTrainees.mockResolvedValue([mockTrainee]);
    const req = nextRequest({ url: "http://localhost:3000/api/trainees?limit=10&offset=0" });
    const res = await GET(req as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe("trainee_1");
    expect(body.data[0].name).toBe("Test Trainee");
    expect(body.data[0].email).toBe("trainee@example.com");
    expect(body.pagination).toEqual({ limit: 10, offset: 0 });
  });

  it("calls listTrainees with parsed pagination params", async () => {
    mockGetRequestUser.mockResolvedValue(adminUser);
    mockListTrainees.mockResolvedValue([]);
    const req = nextRequest({ url: "http://localhost:3000/api/trainees?limit=25&offset=50" });
    await GET(req as never);
    expect(mockListTrainees).toHaveBeenCalledWith({ limit: 25, offset: 50 });
  });
});

describe("POST /api/trainees", () => {
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

  it("returns 201 with created trainee for admin", async () => {
    mockGetRequestUser.mockResolvedValue(adminUser);
    mockCreateTrainee.mockResolvedValue(mockTrainee);
    const req = nextRequest({ method: "POST", body: { name: "John Doe", email: "john@example.com" } });
    const res = await POST(req as never);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.id).toBe("trainee_1");
    expect(body.data.name).toBe("Test Trainee");
    expect(body.data.email).toBe("trainee@example.com");
    expect(mockCreateTrainee).toHaveBeenCalledWith({ name: "John Doe", email: "john@example.com" });
  });

  it("returns 201 with created trainee for trainer_manager", async () => {
    mockGetRequestUser.mockResolvedValue(trainerManager);
    mockCreateTrainee.mockResolvedValue(mockTrainee);
    const req = nextRequest({ method: "POST", body: { name: "Jane", email: "jane@example.com" } });
    const res = await POST(req as never);
    expect(res.status).toBe(201);
  });
});

describe("GET /api/trainees/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetRequestUser.mockResolvedValue(null);
    const req = nextRequest();
    const res = await GET_BY_ID(req as never, dynamicCtx("trainee_1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when trainee not found", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    mockGetTraineeById.mockResolvedValue(null);
    const req = nextRequest();
    const res = await GET_BY_ID(req as never, dynamicCtx("nonexistent"));
    expect(res.status).toBe(404);
  });

  it("returns 200 with trainee data", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    mockGetTraineeById.mockResolvedValue(mockTrainee);
    const req = nextRequest();
    const res = await GET_BY_ID(req as never, dynamicCtx("trainee_1"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe("trainee_1");
    expect(body.data.name).toBe("Test Trainee");
  });
});

describe("PATCH /api/trainees/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetRequestUser.mockResolvedValue(null);
    const req = nextRequest({ method: "PATCH", body: { name: "Updated" } });
    const res = await PATCH(req as never, dynamicCtx("trainee_1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when trainee not found", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    mockUpdateTrainee.mockResolvedValue(null);
    const req = nextRequest({ method: "PATCH", body: { name: "Updated" } });
    const res = await PATCH(req as never, dynamicCtx("nonexistent"));
    expect(res.status).toBe(404);
  });

  it("returns 200 with updated trainee", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    const updated = { ...mockTrainee, name: "Updated Name" };
    mockUpdateTrainee.mockResolvedValue(updated);
    const req = nextRequest({ method: "PATCH", body: { name: "Updated Name" } });
    const res = await PATCH(req as never, dynamicCtx("trainee_1"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe("Updated Name");
  });
});

describe("DELETE /api/trainees/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetRequestUser.mockResolvedValue(null);
    const req = nextRequest();
    const res = await DELETE(req as never, dynamicCtx("trainee_1"));
    expect(res.status).toBe(401);
  });

  it("returns 403 when user lacks admin/trainer_manager role", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    const req = nextRequest();
    const res = await DELETE(req as never, dynamicCtx("trainee_1"));
    expect(res.status).toBe(403);
  });

  it("returns 204 on successful deletion (admin)", async () => {
    mockGetRequestUser.mockResolvedValue(adminUser);
    mockDeleteTrainee.mockResolvedValue(undefined);
    const req = nextRequest();
    const res = await DELETE(req as never, dynamicCtx("trainee_1"));
    expect(res.status).toBe(204);
    expect(mockDeleteTrainee).toHaveBeenCalledWith("trainee_1");
  });
});
