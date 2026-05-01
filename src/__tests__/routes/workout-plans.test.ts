import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/workout-plans/route";
import { GET as GET_BY_ID, PATCH, DELETE } from "@/app/api/workout-plans/[id]/route";

const {
  mockGetRequestUser,
  mockCreateWorkoutPlan,
  mockUpdateWorkoutPlan,
  mockFindMany,
  mockFindFirst,
  mockTransaction,
} = vi.hoisted(() => ({
  mockGetRequestUser: vi.fn(),
  mockCreateWorkoutPlan: vi.fn(),
  mockUpdateWorkoutPlan: vi.fn(),
  mockFindMany: vi.fn(),
  mockFindFirst: vi.fn(),
  mockTransaction: vi.fn(),
}));

vi.mock("@/lib/request-auth", () => ({
  getRequestUser: mockGetRequestUser,
}));

vi.mock("@/db/queries/workout-plans", () => ({
  createWorkoutPlan: mockCreateWorkoutPlan,
  updateWorkoutPlan: mockUpdateWorkoutPlan,
}));

vi.mock("@/db", () => ({
  db: {
    query: {
      workoutPlans: {
        findMany: mockFindMany,
        findFirst: mockFindFirst,
      },
    },
    transaction: mockTransaction,
  },
}));

vi.mock("@/db/schema", () => ({
  exercises: { id: "exercises", workoutPlanId: "workoutPlanId" },
  workoutPlans: { id: "workoutPlans" },
}));

function nextRequest({
  url = "http://localhost:3000/api/workout-plans",
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

const trainerUser = {
  id: "trainer_1",
  email: "trainer@example.com",
  name: "Trainer",
  roles: ["trainer"],
};

const mockPlan = {
  id: "plan_1",
  name: "Upper Body",
  traineeId: "trainee_1",
  occurredAt: new Date(),
  comment: null,
  exercises: [{ id: "ex_1", name: "Bench Press", type: "reps", sets: 3, reps: 10 }],
};

const mockExerciseInput = {
  name: "Bench Press",
  type: "reps" as const,
  sets: 3,
  reps: 10,
};

describe("GET /api/workout-plans", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetRequestUser.mockResolvedValue(null);
    const req = nextRequest();
    const res = await GET(req as never);
    expect(res.status).toBe(401);
  });

  it("returns 400 when traineeId query param is missing", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    const req = nextRequest();
    const res = await GET(req as never);
    expect(res.status).toBe(400);
  });

  it("returns 200 with workout plans for trainee", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    mockFindMany.mockResolvedValue([mockPlan]);
    const req = nextRequest({
      url: "http://localhost:3000/api/workout-plans?traineeId=trainee_1",
    });
    const res = await GET(req as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe("plan_1");
    expect(body.data[0].name).toBe("Upper Body");
    expect(body.data[0].traineeId).toBe("trainee_1");
    expect(body.data[0].exercises).toHaveLength(1);
  });
});

describe("POST /api/workout-plans", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetRequestUser.mockResolvedValue(null);
    const req = nextRequest({
      method: "POST",
      body: { traineeId: "trainee_1", name: "Plan", exercises: [] },
    });
    const res = await POST(req as never);
    expect(res.status).toBe(401);
  });

  it("returns 400 when traineeId is missing", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    const req = nextRequest({
      method: "POST",
      body: { name: "Plan", exercises: [] },
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it("returns 400 when name is missing", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    const req = nextRequest({
      method: "POST",
      body: { traineeId: "trainee_1", exercises: [] },
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it("returns 201 with created workout plan", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    mockCreateWorkoutPlan.mockResolvedValue(mockPlan);
    const req = nextRequest({
      method: "POST",
      body: {
        traineeId: "trainee_1",
        name: "Upper Body",
        occurredAt: "2025-01-01T00:00:00Z",
        comment: "Focus on form",
        exercises: [mockExerciseInput],
      },
    });
    const res = await POST(req as never);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.id).toBe("plan_1");
    expect(body.data.name).toBe("Upper Body");
    expect(mockCreateWorkoutPlan).toHaveBeenCalledWith(
      expect.objectContaining({
        traineeId: "trainee_1",
        name: "Upper Body",
        createdBy: "trainer_1",
        exerciseInputs: [mockExerciseInput],
      }),
    );
  });
});

describe("GET /api/workout-plans/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetRequestUser.mockResolvedValue(null);
    const req = nextRequest();
    const res = await GET_BY_ID(req as never, dynamicCtx("plan_1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when plan not found", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    mockFindFirst.mockResolvedValue(null);
    const req = nextRequest();
    const res = await GET_BY_ID(req as never, dynamicCtx("nonexistent"));
    expect(res.status).toBe(404);
  });

  it("returns 200 with workout plan data", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    mockFindFirst.mockResolvedValue(mockPlan);
    const req = nextRequest();
    const res = await GET_BY_ID(req as never, dynamicCtx("plan_1"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe("plan_1");
    expect(body.data.name).toBe("Upper Body");
    expect(body.data.exercises).toHaveLength(1);
  });
});

describe("PATCH /api/workout-plans/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetRequestUser.mockResolvedValue(null);
    const req = nextRequest({ method: "PATCH", body: { name: "Updated" } });
    const res = await PATCH(req as never, dynamicCtx("plan_1"));
    expect(res.status).toBe(401);
  });

  it("returns 400 when name is missing", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    const req = nextRequest({ method: "PATCH", body: {} });
    const res = await PATCH(req as never, dynamicCtx("plan_1"));
    expect(res.status).toBe(400);
  });

  it("returns 404 when plan not found", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    mockFindFirst.mockResolvedValue(null);
    const req = nextRequest({ method: "PATCH", body: { name: "Updated" } });
    const res = await PATCH(req as never, dynamicCtx("nonexistent"));
    expect(res.status).toBe(404);
  });

  it("returns 200 with updated workout plan", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    const existingPlan = { ...mockPlan, occurredAt: new Date("2025-01-01") };
    mockFindFirst.mockResolvedValue(existingPlan);
    const updatedPlan = { ...mockPlan, name: "Updated Upper Body" };
    mockUpdateWorkoutPlan.mockResolvedValue(updatedPlan);
    const req = nextRequest({
      method: "PATCH",
      body: { name: "Updated Upper Body", exercises: [mockExerciseInput] },
    });
    const res = await PATCH(req as never, dynamicCtx("plan_1"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe("Updated Upper Body");
    expect(mockUpdateWorkoutPlan).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: "plan_1",
        name: "Updated Upper Body",
        updatedBy: "trainer_1",
        exerciseInputs: [mockExerciseInput],
      }),
    );
  });
});

describe("DELETE /api/workout-plans/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetRequestUser.mockResolvedValue(null);
    const req = nextRequest();
    const res = await DELETE(req as never, dynamicCtx("plan_1"));
    expect(res.status).toBe(401);
  });

  it("returns 204 on successful deletion", async () => {
    mockGetRequestUser.mockResolvedValue(trainerUser);
    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<void>) => {
      await fn({ delete: vi.fn().mockReturnValue({ where: vi.fn() }) });
    });
    const req = nextRequest();
    const res = await DELETE(req as never, dynamicCtx("plan_1"));
    expect(res.status).toBe(204);
    expect(mockTransaction).toHaveBeenCalled();
  });
});
