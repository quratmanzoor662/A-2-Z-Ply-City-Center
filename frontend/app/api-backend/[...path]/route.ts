import { NextRequest, NextResponse } from "next/server";
import { isLocalApiUrl } from "@/lib/apiBase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function resolveBackendBase(): string {
  const candidates = [
    process.env.BACKEND_URL,
    process.env.NEXT_PUBLIC_API_URL,
  ]
    .map((v) => (v || "").trim().replace(/\/$/, ""))
    .filter(Boolean);

  for (const url of candidates) {
    // On Vercel, never proxy to localhost
    if (process.env.VERCEL === "1" && isLocalApiUrl(url)) continue;
    if (process.env.NODE_ENV === "production" && isLocalApiUrl(url)) continue;
    return url;
  }

  if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
    return "http://127.0.0.1:8000";
  }

  throw new Error(
    "BACKEND_URL is not set. Add BACKEND_URL=https://your-api.example.com in Vercel env (Production), then redeploy.",
  );
}

async function proxy(req: NextRequest, pathParts: string[]) {
  let backend: string;
  try {
    backend = resolveBackendBase();
  } catch (err) {
    return NextResponse.json(
      { detail: err instanceof Error ? err.message : "Backend not configured" },
      { status: 503 },
    );
  }

  const targetPath = pathParts.join("/");
  const targetUrl = `${backend}/${targetPath}${req.nextUrl.search}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  const authorization = req.headers.get("authorization");
  if (contentType) headers.set("content-type", contentType);
  if (authorization) headers.set("authorization", authorization);
  headers.set("accept", "application/json");

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  try {
    const upstream = await fetch(targetUrl, init);
    const body = await upstream.arrayBuffer();
    const responseHeaders = new Headers();
    const upstreamType = upstream.headers.get("content-type");
    if (upstreamType) responseHeaders.set("content-type", upstreamType);

    return new NextResponse(body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err) {
    return NextResponse.json(
      {
        detail: `Failed to reach backend at ${backend}. ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      },
      { status: 502 },
    );
  }
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
