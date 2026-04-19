import type { SermonBlock } from "@/lib/domain";

/** Verse passage: body text + optional reference line (shown last on final verse slide). */
export type VerseSegment = {
  kind: "verse";
  body: string;
  reference?: string;
  refs: string[];
};

export type BuildSegment =
  | VerseSegment
  | { kind: "simple"; block: SermonBlock };

/**
 * Merge adjacent verse_reference / verse_text pairs (either order) into one verse segment.
 */
export function segmentsFromBlocks(sorted: SermonBlock[]): BuildSegment[] {
  const out: BuildSegment[] = [];
  let i = 0;

  while (i < sorted.length) {
    const b = sorted[i]!;
    const next = sorted[i + 1];

    if (b.type === "verse_reference") {
      if (next?.type === "verse_text") {
        out.push({
          kind: "verse",
          body: next.text,
          reference: b.text,
          refs: [b.id, next.id],
        });
        i += 2;
        continue;
      }
      out.push({
        kind: "verse",
        body: "",
        reference: b.text,
        refs: [b.id],
      });
      i += 1;
      continue;
    }

    if (b.type === "verse_text") {
      if (next?.type === "verse_reference") {
        out.push({
          kind: "verse",
          body: b.text,
          reference: next.text,
          refs: [b.id, next.id],
        });
        i += 2;
        continue;
      }
      out.push({
        kind: "verse",
        body: b.text,
        reference: undefined,
        refs: [b.id],
      });
      i += 1;
      continue;
    }

    out.push({ kind: "simple", block: b });
    i += 1;
  }

  return out;
}
