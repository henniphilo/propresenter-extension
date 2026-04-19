import { NextResponse } from "next/server";

import { presentationModelSchema } from "@/lib/domain";
import { presentationToPptxBuffer } from "@/lib/export/pptx";
import { defaultPresentationTheme } from "@/lib/presentation/theme";
import type { PresentationTheme } from "@/lib/presentation/theme";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid JSON body", code: "invalid_json" } },
      { status: 400 },
    );
  }

  const parsed = body as {
    presentation?: unknown;
    theme?: PresentationTheme;
  };

  try {
    const presentation = presentationModelSchema.parse(parsed.presentation);
    const theme = parsed.theme ?? defaultPresentationTheme;
    const buf = await presentationToPptxBuffer(presentation, theme);
    const filename = `${presentation.id.replace(/[^a-zA-Z0-9-_]/g, "_")}.pptx`;
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Export failed";
    return NextResponse.json(
      { error: { message, code: "export_validation_failed" } },
      { status: 422 },
    );
  }
}
