import type { HttpMethod, QueryFileDoc, RouteDoc } from "@/lib/docs/parsers";
import { getDocsBundle } from "@/lib/docs/registry";

export const dynamic = "force-dynamic";

const AUTH_LABEL: Record<RouteDoc["auth"], string> = {
  "session-or-bearer": "session/bearer",
  "bearer-only": "bearer",
  "sns-signature": "sns-signature",
  public: "public",
};

const METHOD_ORDER: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
];

function formatRoutes(routes: RouteDoc[]): string {
  const lines: string[] = [];
  for (const r of routes) {
    const auth = AUTH_LABEL[r.auth];
    const roles = r.roles.length > 0 ? `  roles=${r.roles.join("|")}` : "";
    for (const method of METHOD_ORDER) {
      if (!r.methods.includes(method)) continue;
      lines.push(
        `${method.padEnd(7)} ${r.urlPath.padEnd(40)} auth=${auth}${roles}  (${r.sourcePath})`,
      );
      const mdoc = r.methodDocs[method];
      if (mdoc) {
        if (mdoc.queryParams) lines.push(`  Query:   ${mdoc.queryParams}`);
        if (mdoc.body) lines.push(`  Body:    ${mdoc.body}`);
        if (mdoc.invokes) lines.push(`  Invokes: ${mdoc.invokes}`);
        if (mdoc.errors) lines.push(`  Errors:  ${mdoc.errors}`);
      }
      lines.push("");
    }
  }
  return lines.join("\n").trimEnd();
}

function formatQueries(queries: QueryFileDoc[]): string {
  const blocks: string[] = [];
  for (const qf of queries) {
    const fns = qf.functions
      .map((fn) => `  - ${fn.isAsync ? "async " : ""}${fn.signature}`)
      .join("\n");
    blocks.push(`### ${qf.file}\n${fns}`);
  }
  return blocks.join("\n\n");
}

export async function GET() {
  const { routes, queries, schemaMarkdown } = await getDocsBundle();

  const body = `# trainer-crm

Auto-generated index of the API surface, DB query helpers, and schema.
Source of truth: src/app/api/, src/db/queries/, AGENTS.md.
A rendered version is at /docs/api.

Conventions:
- All API paths are rooted at /api/.
- Path segments like ":id" are dynamic (Next.js [id]).
- Auth values: session/bearer = cookie session OR Bearer token (Authorization: Bearer <token>);
  bearer = mobile Bearer-only; sns-signature = AWS SNS-signed; public = no auth.
- Each route entry lists Query (GET params), Body (JSON request body), Invokes (DB helpers), Errors (status codes).
- Errors field uses pipe-separated entries: "STATUS description | STATUS description".
  204/201/202 entries in Errors mean the method returns that success code (not an error).
- ExerciseInput type: { name: string; type: "reps"|"duration"; sets: number; reps?: number | null;
  durationSeconds?: number | null; weightLbs?: number | null; comment?: string | null; videoIds?: string[] }

## API routes

${formatRoutes(routes)}

## DB query helpers

${formatQueries(queries)}

${schemaMarkdown}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}
