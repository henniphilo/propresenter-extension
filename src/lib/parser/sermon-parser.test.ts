import { describe, expect, it } from "vitest";

import { parseSermon } from "./sermon-parser";

describe("parseSermon", () => {
  it("extracts title and numbered main points", () => {
    const raw = [
      "Hope in Crisis",
      "",
      "Psalm 23:1-4",
      "",
      "1. God sees you in the valley",
      "• He walks with you",
      "2. Rest in his care",
      "",
      'Quote: "The Lord is my shepherd."',
    ].join("\n");

    const doc = parseSermon(
      { rawText: raw, source: "pdf", fileName: "test.pdf" },
      {},
    );

    expect(doc.title).toBe("Hope in Crisis");
    expect(doc.blocks.map((b) => b.type)).toContain("title");
    expect(doc.blocks.some((b) => b.type === "verse_reference" || b.type === "verse_text")).toBe(
      true,
    );
    expect(doc.blocks.some((b) => b.text.includes("1.") && b.type === "main_point")).toBe(true);
    expect(doc.blocks.some((b) => b.type === "sub_point")).toBe(true);
  });

  it("honors DOCX title hint", () => {
    const raw = "Some body\n\nMore text";
    const doc = parseSermon({ rawText: raw, source: "docx", fileName: "x.docx" }, { titleHint: "From H1" });
    expect(doc.title).toBe("From H1");
  });
});
