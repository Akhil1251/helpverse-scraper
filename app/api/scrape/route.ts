import { NextRequest } from "next/server";
import { runMapsScraper } from "@/lib/scraper/mapsEngine";
import { ScrapeRequestPayload } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const payload: ScrapeRequestPayload = await req.json();

    if (!payload.keyword || !payload.state || !payload.city) {
      return new Response(
        JSON.stringify({ error: "Keyword, State, and City are required fields." }),
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
