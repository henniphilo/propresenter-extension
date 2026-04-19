import { describe, expect, it } from "vitest";

import type { SermonBlock } from "@/lib/domain";

import { segmentsFromBlocks } from "./block-segments";

const block = (b: Partial<SermonBlock> & Pick<SermonBlock, "type" | "text" | "order" | "id">): SermonBlock => ({
  id: b.id,
  type: b.type,
  text: b.text,
  order: b.order,
  confidence: b.confidence,
});

describe("segmentsFromBlocks", () => {
  it("merges verse_reference before verse_text", () => {
    const sorted: SermonBlock[] = [
      block({
        id: "123e4567-e89b-42d3-a456-426614174001",
        type: "verse_reference",
        text: "Psalm 23:1",
        order: 0,
      }),
      block({
        id: "123e4567-e89b-42d3-a456-426614174002",
        type: "verse_text",
        text: "The Lord is my shepherd.",
        order: 1,
      }),
    ];
    const segs = segmentsFromBlocks(sorted);
    expect(segs).toHaveLength(1);
    expect(segs[0]).toMatchObject({
      kind: "verse",
      reference: "Psalm 23:1",
      body: "The Lord is my shepherd.",
    });
  });

  it("merges verse_text before verse_reference", () => {
    const sorted: SermonBlock[] = [
      block({
        id: "123e4567-e89b-42d3-a456-426614174001",
        type: "verse_text",
        text: "Text here.",
        order: 0,
      }),
      block({
        id: "123e4567-e89b-42d3-a456-426614174002",
        type: "verse_reference",
        text: "John 3:16",
        order: 1,
      }),
    ];
    const segs = segmentsFromBlocks(sorted);
    expect(segs[0]).toMatchObject({
      kind: "verse",
      body: "Text here.",
      reference: "John 3:16",
    });
  });
});
