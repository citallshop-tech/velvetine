import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const rawPath = typeof body?.path === "string" ? body.path : "/";
  const path = rawPath.slice(0, 200);
  const visitorId = typeof body?.visitorId === "string" ? body.visitorId.slice(0, 100) : "unknown";

  await prisma.pageView.create({
    data: { path, visitorHash: visitorId },
  });

  return NextResponse.json({ ok: true });
}
