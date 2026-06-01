import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createOllama } from "ollama-ai-provider";
import { createGoogle } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { buildDesignMdPrompt } from "@/lib/design-md";
import { normalizeDomain, domainToUrl } from "@/lib/domain";
import { getCached, setCached } from "@/lib/turso";
import type { DesignMdRequest, DesignMdResponse } from "@/lib/api-types";

type CachedDesignMd = { designMd: string; markdownLength: number };

export const runtime = "nodejs";
export const maxDuration = 120;

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
      { status: "error", message: "Invalid domain" } satisfies DesignMdResponse,
      { status: 400 },
    );
  }

  const tursoCached = await getCached<CachedDesignMd>(domain, "designmd");
  if (tursoCached) {
    return NextResponse.json(
      {
        status: "ready",
        designMd: tursoCached.designMd,
        markdownLength: tursoCached.markdownLength,
      } satisfies DesignMdResponse,
      { headers: CACHE_HEADERS },
    );
  }

  return NextResponse.json({ status: "miss" } satisfies DesignMdResponse, {
    headers: CACHE_HEADERS,
  });
}

// Инициализируем модель динамически на основе настроек из .env
function getActiveModel() {
  const providerType = process.env.AI_PROVIDER || "openai";
  const modelName = process.env.AI_MODEL || "gpt-4o-mini";

  switch (providerType) {
    case "openrouter":
      return createOpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
        compatibility: "compatible",
      }).chat(modelName);

    case "ollama":
      return createOllama({
        baseURL: process.env.OLLAMA_URL || "http://127.0.0.1:11434/api",
      })(modelName);

    case "google":
      return createGoogle({
        apiKey: process.env.GOOGLE_API_KEY,
      })(modelName);

    case "anthropic":
      return createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      })(modelName);

    case "custom":
      // Вариант для кастомных шлюзов (например, FreeLLMAPI)
      return createOpenAI({
        baseURL: process.env.LOCAL_GATEWAY_URL || "http://127.0.0.1:3001/v1",
        apiKey: process.env.LOCAL_GATEWAY_API_KEY || "local-key",
        compatibility: "compatible",
      }).chat(modelName);

    default:
      // Стандартный OpenAI
      return createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        compatibility: "compatible",
      }).chat(modelName);
  }
}

export async function POST(req: NextRequest) {
  let body: DesignMdRequest;
  try {
    body = (await req.json()) as DesignMdRequest;
  } catch {
    return NextResponse.json(
      { status: "error", message: "Invalid JSON body" } satisfies DesignMdResponse,
      { status: 400 },
    );
  }

  const domain = normalizeDomain(body?.domain ?? "");
  if (!domain) {
    return NextResponse.json(
      { status: "error", message: "Invalid domain" } satisfies DesignMdResponse,
      { status: 400 },
    );
  }

  const tursoCached = await getCached<CachedDesignMd>(domain, "designmd");
  if (tursoCached) {
    return NextResponse.json({
      status: "ready",
      designMd: tursoCached.designMd,
      markdownLength: tursoCached.markdownLength,
    } satisfies DesignMdResponse);
  }

  try {
    let markdown = "";
    const cachedMd = await getCached<{ markdown: string }>(domain, "markdown");
    if (cachedMd) {
      markdown = cachedMd.markdown;
    } else {
      try {
        const res = await fetch(`https://r.jina.ai/${domainToUrl(domain)}`);
        if (res.ok) {
          markdown = await res.text();
          if (markdown) {
            await setCached(domain, "markdown", { markdown });
          }
        }
      } catch (e) {
        console.error("Jina Reader fetch failed:", e);
        markdown = "";
      }
    }

    const prompt = buildDesignMdPrompt({
      domain,
      contextStyleguide: body.styleguide ?? null,
      screenshotUrl: body.screenshotUrl ?? undefined,
      markdown,
    });

    const userContent = body.screenshotUrl
      ? [
          { type: "image" as const, image: new URL(body.screenshotUrl) },
          { type: "text" as const, text: prompt },
        ]
      : [{ type: "text" as const, text: prompt }];

    console.log("=== API ROUTE INFO ===");
    console.log("Provider: ", process.env.AI_PROVIDER || "openai");
    console.log("Model:    ", process.env.AI_MODEL || "gpt-4o-mini");
    console.log("======================");

    const activeModel = getActiveModel();

    const { text } = await generateText({
      model: activeModel,
      system:
        "You are a senior design systems writer. Produce concise, implementation-grade DESIGN.md files that follow the requested spec.",
      messages: [{ role: "user", content: userContent }],
      temperature: 0.2,
    });

    const designMd = text.trim();
    await setCached(domain, "designmd", {
      designMd,
      markdownLength: markdown.length,
    } satisfies CachedDesignMd);

    return NextResponse.json({
      status: "ready",
      designMd,
      markdownLength: markdown.length,
    } satisfies DesignMdResponse);
  } catch (error: any) {
    console.error("=== GENERATION ERROR DETAIL ===");
    console.error(error);
    if (error.responseBody) console.error("RESPONSE BODY:", error.responseBody);
    if (error.status) console.error("STATUS:", error.status);
    console.error("===============================");

    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "DESIGN.md compose failed",
      } satisfies DesignMdResponse,
      { status: 502 },
    );
  }
}