import { execSync } from "node:child_process";
import path from "node:path";
import { PostgreSqlContainer } from "@testcontainers/postgresql";

let stopContainer: (() => Promise<void>) | null = null;

export async function setup() {
  const container = await new PostgreSqlContainer("postgres:16-alpine").start();

  const url = container.getConnectionUri();
  process.env.DATABASE_URL = url;
  process.env.DATABASE_URL_UNPOOLED = url;

  stopContainer = async () => {
    await container.stop();
  };

  // Run migrations against the test container
  const root = path.resolve(import.meta.dirname, "../../..");
  execSync("pnpm drizzle-kit migrate", {
    cwd: root,
    env: { ...process.env, DATABASE_URL: url, DATABASE_URL_UNPOOLED: url },
    stdio: "pipe",
  });
}

export async function teardown() {
  await stopContainer?.();
}
