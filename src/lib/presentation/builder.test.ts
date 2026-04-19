import { describe, expect, it } from "vitest";

import type { SermonBlock, SermonDocument } from "@/lib/domain";

import { buildPresentation } from "./builder";
import { defaultPresentationTheme } from "./theme";

const block = (partial: Omit<SermonBlock, "id"> & { id?: string }): SermonBlock => ({
  id: partial.id ?? "123e4567-e89b-12d3-a456-426614174000",
  type: partial.type,
  text: partial.text,
  order: partial.order,
  confidence: partial.confidence,
});

describe("buildPresentation", () => {
  it("maps blocks to slides and rolls notes into speaker notes", () => {
    const sermon: SermonDocument = {
      id: "sermon-test",
      title: "Test",
      source: "docx",
      importedAt: new Date().toISOString(),
      rawText: "",
      blocks: [
        block({
          type: "title",
          text: "Test",
          order: 0,
          id: "123e4567-e89b-12d3-a456-426614174001",
        }),
        block({
          type: "main_point",
          text: "Point A",
          order: 1,
          id: "123e4567-e89b-12d3-a456-426614174002",
        }),
        block({
          type: "notes",
          text: "Say slowly",
          order: 2,
          id: "123e4567-e89b-12d3-a456-426614174003",
        }),
      ],
      metadata: {
        fileName: "x.docx",
        parserVersion: "1.0.0",
      },
    };

    const pres = buildPresentation(sermon, defaultPresentationTheme);
    expect(pres.slides.length).toBe(2);
    expect(pres.slides[1]?.speakerNotes).toContain("Say slowly");
  });
});
