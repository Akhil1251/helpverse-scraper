import { NextRequest } from "next/server";
import { runMapsScraper } from "@/lib/scraper/mapsEngine";
import { ScrapeRequestPayload } from "@/lib/types";
import { verifyAuthToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    // End-to-end security: Validate admin auth token from cookie or header
    const token =
      req.cookies.get(AUTH_COOKIE_NAME)?.value ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const user = verifyAuthToken(token);

    if (!user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized: Please log in with admin credentials to use the scraper.",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const payload: ScrapeRequestPayload = await req.json();

    const hasTargets =
      (payload.targets && Array.isArray(payload.targets) && payload.targets.length > 0) ||
      (payload.state && payload.city);

    if (!payload.keyword || !hasTargets) {
      return new Response(
        JSON.stringify({ error: "Keyword and at least one target location (City & State) are required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of runMapsScraper(payload)) {
            const chunk = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (err: any) {
          const errorChunk = `data: ${JSON.stringify({
            type: "error",
            data: { message: err?.message || "Scraping pipeline encountered an error." },
          })}\n\n`;
          controller.enqueue(encoder.encode(errorChunk));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "Failed to initiate scraper." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
