import { NextResponse } from "next/server";

import { extractDocx, extractPdf, MAX_IMPORT_BYTES } from "@/lib/import";
import { enrichSermonDocument, parseSermon } from "@/lib/parser";

export const runtime = "nodejs";

function badRequest(message: string, code: string) {
  return NextResponse.json({ error: { message, code } }, { status: 400 });
}

export async function POST(request: Request) {
  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("multipart/form-data")) {
    return badRequest("Expected multipart/form-data", "invalid_content_type");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return badRequest("Could not read form data", "form_parse_error");
  }

  const file = form.get("file");
  if (!file || !(file instanceof Blob)) {
    return badRequest("Missing file field", "missing_file");
  }

  if (file.size > MAX_IMPORT_BYTES) {
    return badRequest(
      `File exceeds maximum size of ${MAX_IMPORT_BYTES} bytes`,
      "file_too_large",
    );
  }

  const name = file instanceof File ? file.name : "upload";
  const lower = name.toLowerCase();

  let buffer: Buffer;
  try {
    const ab = await file.arrayBuffer();
    buffer = Buffer.from(ab);
  } catch {
    return badRequest("Could not read file bytes", "read_error");
  }

  try {
    if (lower.endsWith(".docx")) {
      const extracted = await extractDocx(buffer);
      const doc = parseSermon(
        {
          rawText: extracted.text,
          source: "docx",
          fileName: name,
          importedAt: new Date().toISOString(),
        },
        { titleHint: extracted.titleHint },
      );
      const enriched = await enrichSermonDocument(doc);
      return NextResponse.json({ document: enriched });
    }

    if (lower.endsWith(".pdf")) {
      const extracted = await extractPdf(buffer);
      const doc = parseSermon({
        rawText: extracted.text,
        source: "pdf",
        fileName: name,
        importedAt: new Date().toISOString(),
        pageCount: extracted.pageCount,
      });
      const enriched = await enrichSermonDocument(doc);
      return NextResponse.json({ document: enriched });
    }

    return badRequest("Only .docx and .pdf are supported", "unsupported_type");
  } catch (e) {
    const message = e instanceof Error ? e.message : "Import failed";
    return NextResponse.json(
      { error: { message, code: "import_failed" } },
      { status: 422 },
    );
  }
}
