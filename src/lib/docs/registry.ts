import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import {
  parseQueriesFile,
  parseRouteFile,
  type QueryFileDoc,
  type RouteDoc,
  urlPathFromFile,
} from "./parsers";

const isDev = process.env.NODE_ENV !== "production";
const TTL_MS = isDev ? 5_000 : Number.POSITIVE_INFINITY;

type CacheEntry<T> = { value: T; expiresAt: number };
const cache = new Map<string, CacheEntry<unknown>>();

async function memo<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  if (hit && hit.expiresAt > Date.now()) return hit.value;
  const value = await load();
  cache.set(key, { value, expiresAt: Date.now() + TTL_MS });
  return value;
}

const PROJECT_ROOT = process.cwd();
const API_ROOT = path.join(PROJECT_ROOT, "src", "app", "api");
const QUERIES_ROOT = path.join(PROJECT_ROOT, "src", "db", "queries");
const AGENTS_PATH = path.join(PROJECT_ROOT, "AGENTS.md");

async function walkRoutes(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries: Awaited<ReturnType<typeof fs.readdir>>;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walkRoutes(full)));
    } else if (entry.name === "route.ts" || entry.name === "route.tsx") {
      out.push(full);
    }
  }
  return out;
}

export async function getApiRoutes(): Promise<RouteDoc[]> {
  return memo("routes", async () => {
    const files = await walkRoutes(API_ROOT);
    const docs: RouteDoc[] = [];
    for (const file of files) {
      const source = await fs.readFile(file, "utf8");
      const rel = path.relative(API_ROOT, file).split(path.sep).join("/");
      const urlPath = urlPathFromFile(rel);
      const sourcePath = path
        .relative(PROJECT_ROOT, file)
        .split(path.sep)
        .join("/");
      docs.push(parseRouteFile(source, urlPath, sourcePath));
    }
    return docs.sort((a, b) => a.urlPath.localeCompare(b.urlPath));
  });
}

export async function getDbQueries(): Promise<QueryFileDoc[]> {
  return memo("queries", async () => {
    let entries: Awaited<ReturnType<typeof fs.readdir>>;
    try {
      entries = await fs.readdir(QUERIES_ROOT, { withFileTypes: true });
    } catch {
      return [];
    }
    const out: QueryFileDoc[] = [];
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".ts")) continue;
      const full = path.join(QUERIES_ROOT, entry.name);
      const source = await fs.readFile(full, "utf8");
      const functions = parseQueriesFile(source);
      if (functions.length === 0) continue;
      out.push({
        file: `src/db/queries/${entry.name}`,
        functions,
      });
    }
    return out.sort((a, b) => a.file.localeCompare(b.file));
  });
}

export async function getSchemaMarkdown(): Promise<string> {
  return memo("schema", async () => {
    let raw: string;
    try {
      raw = await fs.readFile(AGENTS_PATH, "utf8");
    } catch {
      return "_AGENTS.md not found at project root._";
    }
    const startMatch = raw.match(/^# Database schema\s*$/m);
    if (!startMatch)
      return "_Could not locate `# Database schema` in AGENTS.md._";
    const startIdx = startMatch.index ?? 0;
    const after = raw.slice(startIdx + startMatch[0].length);
    const nextHeadingIdx = after.search(/^# [^\n]/m);
    const body = nextHeadingIdx === -1 ? after : after.slice(0, nextHeadingIdx);
    return `# Database schema${body}`.trim();
  });
}

export type DocsBundle = {
  routes: RouteDoc[];
  queries: QueryFileDoc[];
  schemaMarkdown: string;
};

export async function getDocsBundle(): Promise<DocsBundle> {
  const [routes, queries, schemaMarkdown] = await Promise.all([
    getApiRoutes(),
    getDbQueries(),
    getSchemaMarkdown(),
  ]);
  return { routes, queries, schemaMarkdown };
}
