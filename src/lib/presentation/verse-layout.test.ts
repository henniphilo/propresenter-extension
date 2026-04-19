import { describe, expect, it } from "vitest";

import {
  MAX_VERSE_LINES_PER_SLIDE,
  partitionVerseSlideLines,
  verseBodyToLines,
  wrapParagraphToLines,
} from "./verse-layout";

describe("verseBodyToLines", () => {
  it("respects manual line breaks then wraps long lines", () => {
    const lines = verseBodyToLines("Short line.\n" + "x".repeat(90), 44);
    expect(lines.length).toBeGreaterThan(2);
    expect(lines[0]).toBe("Short line.");
  });
});

describe("partitionVerseSlideLines", () => {
  it("never exceeds max lines including reference on final slide", () => {
    const lines = ["a", "b", "c", "d", "e"];
    const slides = partitionVerseSlideLines(lines, "John 3:16");
    for (const s of slides) {
      expect(s.length).toBeLessThanOrEqual(MAX_VERSE_LINES_PER_SLIDE);
    }
    expect(slides[slides.length - 1]?.includes("John 3:16")).toBe(true);
  });

  it("puts reference last on the final slide when splitting", () => {
    const lines = ["l1", "l2", "l3", "l4", "l5"];
    const slides = partitionVerseSlideLines(lines, "Ref");
    expect(slides.length).toBeGreaterThan(1);
    expect(slides[slides.length - 1]?.[slides[slides.length - 1]!.length - 1]).toBe("Ref");
  });
});

describe("wrapParagraphToLines", () => {
  it("wraps by word", () => {
    const w = wrapParagraphToLines("one two three four five six seven eight", 12);
    expect(w.length).toBeGreaterThan(1);
  });
});
