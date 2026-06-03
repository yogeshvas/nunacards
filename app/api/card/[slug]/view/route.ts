import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// In-memory IP rate limit: "ip:slug" → last view timestamp
const viewRateCache = new Map<string, number>();
const RATE_WINDOW_MS = 5 * 60 * 1000; // 5 min

function isRateLimited(ip: string, slug: string): boolean {
  const key = `${ip}:${slug}`;
  const now = Date.now();
  const last = viewRateCache.get(key);
  if (last && now - last < RATE_WINDOW_MS) return true;
  viewRateCache.set(key, now);
  // Prune stale entries to prevent unbounded memory growth
  if (viewRateCache.size > 10000) {
    for (const [k, ts] of viewRateCache.entries()) {
      if (now - ts > RATE_WINDOW_MS) viewRateCache.delete(k);
    }
  }
  return false;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { isUnique } = await req.json() as { isUnique: boolean };

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    if (isRateLimited(ip, slug)) {
      return NextResponse.json({ ok: true });
    }

    const employee = await prisma.user.findFirst({
      where: { slug, archived: false },
      select: { id: true },
    });

    if (!employee) return NextResponse.json({ ok: false }, { status: 404 });

    await prisma.cardView.create({
      data: { employeeId: employee.id, isUnique: Boolean(isUnique) },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
