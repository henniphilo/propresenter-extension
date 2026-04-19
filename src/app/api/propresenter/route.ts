import { NextResponse } from "next/server";

import { getProPresenterClient } from "@/lib/propresenter";

export const runtime = "nodejs";

type Body = {
  action:
    | "connect"
    | "getStatus"
    | "listPresentations"
    | "triggerPresentation"
    | "triggerSlide"
    | "nextSlide"
    | "previousSlide"
    | "showStageMessage";
  baseUrl?: string | null;
  password?: string;
  presentationId?: string;
  slideIndex?: number;
  text?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const baseUrl = searchParams.get("baseUrl");
  try {
    const client = getProPresenterClient(baseUrl);
    const status = await client.getStatus();
    return NextResponse.json({ status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "ProPresenter error";
    return NextResponse.json(
      { error: { message, code: "pp_error" } },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid JSON", code: "invalid_json" } },
      { status: 400 },
    );
  }

  const client = getProPresenterClient(body.baseUrl);

  try {
    switch (body.action) {
      case "connect":
        await client.connect({
          baseUrl: body.baseUrl ?? "http://127.0.0.1:50001",
          password: body.password,
        });
        return NextResponse.json({ ok: true });
      case "getStatus": {
        const status = await client.getStatus();
        return NextResponse.json({ status });
      }
      case "listPresentations": {
        const presentations = await client.listPresentations();
        return NextResponse.json({ presentations });
      }
      case "triggerPresentation":
        if (!body.presentationId) {
          return NextResponse.json(
            { error: { message: "presentationId required", code: "missing_id" } },
            { status: 400 },
          );
        }
        await client.triggerPresentation(body.presentationId);
        return NextResponse.json({ ok: true });
      case "triggerSlide":
        if (
          body.presentationId === undefined ||
          body.slideIndex === undefined ||
          body.slideIndex < 0
        ) {
          return NextResponse.json(
            {
              error: {
                message: "presentationId and slideIndex required",
                code: "missing_slide",
              },
            },
            { status: 400 },
          );
        }
        await client.triggerSlide(body.presentationId, body.slideIndex);
        return NextResponse.json({ ok: true });
      case "nextSlide":
        await client.nextSlide();
        return NextResponse.json({ ok: true });
      case "previousSlide":
        await client.previousSlide();
        return NextResponse.json({ ok: true });
      case "showStageMessage":
        if (!body.text?.trim()) {
          return NextResponse.json(
            { error: { message: "text required", code: "missing_text" } },
            { status: 400 },
          );
        }
        await client.showStageMessage(body.text);
        return NextResponse.json({ ok: true });
      default:
        return NextResponse.json(
          { error: { message: "Unknown action", code: "unknown_action" } },
          { status: 400 },
        );
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "ProPresenter error";
    return NextResponse.json(
      { error: { message, code: "pp_error" } },
      { status: 502 },
    );
  }
}
