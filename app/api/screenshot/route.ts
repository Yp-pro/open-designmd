import { NextRequest, NextResponse } from "next/server";
import { normalizeDomain, domainToUrl } from "@/lib/domain";
import { getCached, setCached } from "@/lib/turso";
import type { LiveScreenshot } from "@/lib/api-types";

export const runtime = "nodejs";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=3600",
  "CDN-Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
  "Vercel-CDN-Cache-Control":
    "public, s-maxage=2592000, stale-while-revalidate=2592000",
};

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("domain") ?? "";
  const domain = normalizeDomain(raw);
  if (!domain) {
    return NextResponse.json(
      { status: "error", message: "Invalid domain", url: null } satisfies LiveScreenshot,
      { status: 400 }
    );
  }

  // Проверяем кэш базы данных
  const tursoCached = await getCached<LiveScreenshot>(domain, "screenshot");
  if (tursoCached) {
    return NextResponse.json(tursoCached, { headers: CACHE_HEADERS });
  }

  try {
    const targetUrl = domainToUrl(domain);
    let screenshotUrl = null;

    try {
      // Конфигурируем Microlink: ждем 3 секунды, отключаем анимации, задаем Full HD разрешение
      const microlinkApi = `https://api.microlink.io/` +
        `?url=${encodeURIComponent(targetUrl)}` +
        `&screenshot=true` +
        `&waitForTimeout=3000` +
        `&animations=false` +
        `&viewport.width=1920` +
        `&viewport.height=1080` +
        `&viewport.deviceScaleFactor=1`;

      const res = await fetch(microlinkApi);
      if (res.ok) {
        const json = await res.json();
        screenshotUrl = json.data?.screenshot?.url || null;
      }
    } catch (e) {
      console.error("Microlink screenshot fetch failed, trying fallback:", e);
    }

    if (!screenshotUrl) {
      screenshotUrl = `https://image.thum.io/get/${targetUrl}`;
    }

    const body: LiveScreenshot = {
      status: "ready",
      url: screenshotUrl,
    };

    await setCached(domain, "screenshot", body);

    return NextResponse.json(body, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error("All screenshot attempts failed:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Screenshot failed",
        url: null,
      } satisfies LiveScreenshot,
      { status: 502 }
    );
  }
}