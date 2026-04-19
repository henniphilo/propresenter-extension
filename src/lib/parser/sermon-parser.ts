import type {
  SermonBlock,
  SermonDocument,
  SermonSection,
  SermonSource,
} from "@/lib/domain";
import { sermonDocumentSchema } from "@/lib/domain";
import { PARSER_VERSION } from "@/lib/parser/version";

export type ParseHints = {
  /** Prefer this as sermon title when provided (e.g. first DOCX &lt;h1&gt;). */
  titleHint?: string;
};

const NUMBERED_MAIN = /^\s*(\d{1,2})[.)]\s+(.+)/;
const ROMAN_MAIN = /^\s*([IVX]{1,4})\.\s+(.+)/i;

const BULLET_SUB =
  /^\s*(?:[-*•◦]|[a-z]\)|\([a-z]\))\s+(.+)/i;

/** Recognizes references like Psalm 23:1, John 3:16-18, 1 Pet 5:7 */
const VERSE_REF =
  /\b(?:(?:[1-3]\s+)?[A-Za-z][A-Za-z\s.&]{1,40}?)\s+(\d{1,3}:\d{1,3}(?:\s*[-–]\s*\d{1,3})?)\b/;

const NOTES_SECTION = /^(message notes|speaker notes|notes for speaker)\s*:?\s*$/i;

const PRAYER_LINE =
  /^(prayer|benediction|closing prayer|call to action)\s*:?\s*$/i;

const CLOSING_LINE =
  /^(closing|conclusion|benedic|amen)\b/i;

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function newId(): string {
  return crypto.randomUUID();
}

function makeBlock(
  type: SermonBlock["type"],
  text: string,
  order: number,
  confidence?: number,
): SermonBlock {
  return {
    id: newId(),
    type,
    text: text.trim(),
    order,
    confidence,
  };
}

function paragraphsFromText(text: string): { text: string }[] {
  const parts = normalizeNewlines(text).split(/\n\s*\n+/);
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => ({ text: p.replace(/\n+/g, " ").trim() }));
}

function buildSections(rawText: string): SermonSection[] | undefined {
  const paras = paragraphsFromText(rawText);
  if (paras.length === 0) {
    return undefined;
  }
  return [
    {
      id: "sec-1",
      label: "Body",
      paragraphs: paras.map((p) => ({ text: p.text })),
    },
  ];
}

function pickTitle(lines: string[], hints: ParseHints): string {
  if (hints.titleHint?.trim()) {
    return hints.titleHint.trim().slice(0, 200);
  }
  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      continue;
    }
    const m = t.match(/^title\s*:\s*(.+)$/i);
    if (m?.[1]) {
      return m[1].trim().slice(0, 200);
    }
    if (t.length <= 120) {
      return t;
    }
    return t.slice(0, 120).trim();
  }
  return "Untitled sermon";
}

/**
 * Deterministic heuristic parse. Refine in review UI; optionally replace via `enrich` later.
 */
export function parseSermon(
  input: {
    rawText: string;
    source: SermonSource;
    fileName: string;
    importedAt?: string;
    pageCount?: number;
  },
  hints: ParseHints = {},
): SermonDocument {
  const rawText = normalizeNewlines(input.rawText).trim();
  const lines = rawText.split("\n").map((l) => l.trimEnd());
  const title = pickTitle(lines, hints);

  const blocks: SermonBlock[] = [];
  let order = 0;

  blocks.push(makeBlock("title", title, order++, 0.85));

  let inNotesSection = false;
  let lastWasMainPoint = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    if (trimmed.toLowerCase() === title.toLowerCase() && blocks[0]?.type === "title") {
      continue;
    }

    if (NOTES_SECTION.test(trimmed)) {
      inNotesSection = true;
      continue;
    }

    if (inNotesSection) {
      blocks.push(makeBlock("notes", trimmed, order++, 0.6));
      continue;
    }

    if (PRAYER_LINE.test(trimmed) && trimmed.length < 80) {
      blocks.push(makeBlock("prayer", trimmed, order++, 0.65));
      lastWasMainPoint = false;
      continue;
    }

    if (CLOSING_LINE.test(trimmed) && trimmed.length < 100) {
      blocks.push(makeBlock("closing", trimmed, order++, 0.55));
      lastWasMainPoint = false;
      continue;
    }

    const quoteMatch =
      trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length > 6;
    const quoteLabel = /^quote\s*:\s*(.+)$/i.exec(trimmed);
    if (quoteMatch || quoteLabel) {
      blocks.push(
        makeBlock("quote", quoteLabel ? quoteLabel[1]!.trim() : trimmed, order++, 0.7),
      );
      lastWasMainPoint = false;
      continue;
    }

    if (VERSE_REF.test(trimmed) && trimmed.length < 160) {
      const isLong = trimmed.length > 90;
      blocks.push(
        makeBlock(
          isLong ? "verse_text" : "verse_reference",
          trimmed,
          order++,
          isLong ? 0.55 : 0.75,
        ),
      );
      lastWasMainPoint = false;
      continue;
    }

    const mainMatch = NUMBERED_MAIN.exec(trimmed);
    const romanMatch = ROMAN_MAIN.exec(trimmed);
    if (mainMatch?.[2] || romanMatch?.[2]) {
      blocks.push(makeBlock("main_point", trimmed, order++, 0.8));
      lastWasMainPoint = true;
      continue;
    }

    const bullet = BULLET_SUB.exec(trimmed);
    if (bullet && lastWasMainPoint) {
      blocks.push(makeBlock("sub_point", trimmed, order++, 0.72));
      continue;
    }

    if (bullet) {
      blocks.push(makeBlock("sub_point", trimmed, order++, 0.55));
      continue;
    }

    blocks.push(makeBlock("unknown", trimmed, order++, 0.35));
    lastWasMainPoint = false;
  }

  const docId = `sermon-${new Date().toISOString().slice(0, 10)}-${newId().slice(0, 8)}`;

  const sections = buildSections(rawText);

  const doc: SermonDocument = {
    id: docId,
    title,
    source: input.source,
    importedAt: input.importedAt ?? new Date().toISOString(),
    rawText,
    sections,
    blocks,
    metadata: {
      fileName: input.fileName,
      pageCount: input.pageCount,
      parserVersion: PARSER_VERSION,
    },
  };

  return sermonDocumentSchema.parse(doc);
}
