export type RouteAuth =
  | "session-or-bearer"
  | "bearer-only"
  | "sns-signature"
  | "public";

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD";

export type RouteDoc = {
  urlPath: string;
  methods: HttpMethod[];
  auth: RouteAuth;
  roles: string[];
  sourcePath: string;
};

export type QueryFunctionDoc = {
  name: string;
  signature: string;
  isAsync: boolean;
};

export type QueryFileDoc = {
  file: string;
  functions: QueryFunctionDoc[];
};

const HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "HEAD",
] as const;

const METHOD_RE = new RegExp(
  `export\\s+(?:async\\s+)?(?:function|const)\\s+(${HTTP_METHODS.join("|")})\\b`,
  "g",
);

const ROLE_LIST_RE = /new\s+Set\s*\(\s*\[([^\]]+)\]\s*as\s+const\s*\)/g;

export function detectMethods(source: string): HttpMethod[] {
  const found = new Set<HttpMethod>();
  for (const match of source.matchAll(METHOD_RE)) {
    found.add(match[1] as HttpMethod);
  }
  return [...found].sort(
    (a, b) => HTTP_METHODS.indexOf(a) - HTTP_METHODS.indexOf(b),
  );
}

export function detectAuth(source: string): RouteAuth {
  if (/\bgetRequestUser\s*\(/.test(source)) return "session-or-bearer";
  if (/\bgetApiUser\s*\(/.test(source)) return "session-or-bearer";
  if (/\bgetMobileUser\s*\(/.test(source)) return "bearer-only";
  if (/\bMessageValidator\b|\bsns-validator\b/.test(source)) {
    return "sns-signature";
  }
  return "public";
}

export function detectRoles(source: string): string[] {
  const roles = new Set<string>();
  for (const match of source.matchAll(ROLE_LIST_RE)) {
    const inner = match[1];
    for (const tok of inner.split(",")) {
      const cleaned = tok.trim().replace(/^["'`]|["'`]$/g, "");
      if (cleaned) roles.add(cleaned);
    }
  }
  return [...roles];
}

export function parseRouteFile(
  source: string,
  urlPath: string,
  sourcePath: string,
): RouteDoc {
  return {
    urlPath,
    methods: detectMethods(source),
    auth: detectAuth(source),
    roles: detectRoles(source),
    sourcePath,
  };
}

export function urlPathFromFile(relPathFromAppApi: string): string {
  // relPathFromAppApi: "trainees/[id]/route.ts" or "trainees/route.ts"
  const trimmed = relPathFromAppApi.replace(/\/route\.tsx?$/, "");
  if (trimmed === "" || trimmed === "route.ts" || trimmed === "route.tsx") {
    return "/api";
  }
  const segments = trimmed
    .split("/")
    .map((seg) =>
      seg.startsWith("[") && seg.endsWith("]")
        ? `:${seg.slice(1, -1).replace(/^\.\.\./, "")}`
        : seg,
    );
  return `/api/${segments.join("/")}`;
}

const FN_RE =
  /export\s+(async\s+)?function\s+(\w+)\s*(\([\s\S]*?\))(\s*:\s*[^={]+)?\s*\{/g;

export function parseQueriesFile(source: string): QueryFunctionDoc[] {
  const fns: QueryFunctionDoc[] = [];
  for (const match of source.matchAll(FN_RE)) {
    const isAsync = Boolean(match[1]);
    const name = match[2];
    const params = collapseWhitespace(match[3]);
    const ret = match[4] ? collapseWhitespace(match[4]) : "";
    fns.push({
      name,
      signature: `${name}${params}${ret}`,
      isAsync,
    });
  }
  return fns;
}

function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}
