import type { QueryFileDoc, RouteDoc } from "@/lib/docs/parsers";
import { getDocsBundle } from "@/lib/docs/registry";

export const dynamic = "force-dynamic";

const AUTH_LABEL: Record<RouteDoc["auth"], string> = {
  "session-or-bearer": "session/bearer",
  "bearer-only": "bearer",
  "sns-signature": "sns-signature",
  public: "public",
};

function formatRoutes(routes: RouteDoc[]): string {
  const lines: string[] = [];
  for (const r of routes) {
    const methods = r.methods.length > 0 ? r.methods.join(",") : "—";
    const auth = AUTH_LABEL[r.auth];
    const roles = r.roles.length > 0 ? ` roles=${r.roles.join("|")}` : "";
    lines.push(
      `- ${methods.padEnd(12)} ${r.urlPath.padEnd(38)} auth=${auth}${roles}  (${r.sourcePath})`,
    );
  }
  return lines.join("\n");
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
- Auth values: session/bearer = cookie session OR Bearer JWT;
  bearer = mobile Bearer-only; sns-signature = AWS SNS-signed; public = no auth.

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
