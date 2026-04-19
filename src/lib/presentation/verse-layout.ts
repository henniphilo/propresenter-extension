/** Max visible lines per verse slide (including the reference line). */
export const MAX_VERSE_LINES_PER_SLIDE = 4;

/** Approximate wrap width for verse body when manuscripts lack manual line breaks. */
export const VERSE_WRAP_CHARS = 44;

/**
 * Wrap a single paragraph into lines by words (deterministic).
 */
function chunkLongToken(token: string, maxChars: number): string[] {
  if (token.length <= maxChars) {
    return [token];
  }
  const parts: string[] = [];
  for (let i = 0; i < token.length; i += maxChars) {
    parts.push(token.slice(i, i + maxChars));
  }
  return parts;
}

export function wrapParagraphToLines(text: string, maxChars: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [];
  }
  const lines: string[] = [];
  let current = "";

  const flushCurrent = () => {
    if (current) {
      lines.push(current);
      current = "";
    }
  };

  const appendWord = (rawWord: string) => {
    const chunks = chunkLongToken(rawWord, maxChars);
    for (const chunk of chunks) {
      if (!current) {
        current = chunk;
        continue;
      }
      const candidate = `${current} ${chunk}`;
      if (candidate.length <= maxChars) {
        current = candidate;
      } else {
        lines.push(current);
        current = chunk;
      }
    }
  };

  for (const w of words) {
    appendWord(w);
  }
  flushCurrent();

  return lines;
}

/**
 * Turn verse body into discrete lines (respect `\n`, then wrap long segments).
 */
export function verseBodyToLines(body: string, wrapChars: number): string[] {
  const trimmed = body.trim();
  if (!trimmed) {
    return [];
  }
  const paragraphs = trimmed.split(/\n+/);
  const out: string[] = [];
  for (const p of paragraphs) {
    const t = p.trim();
    if (!t) {
      continue;
    }
    if (t.length <= wrapChars) {
      out.push(t);
    } else {
      out.push(...wrapParagraphToLines(t, wrapChars));
    }
  }
  return out;
}

/**
 * Split verse lines into slides: max {@link MAX_VERSE_LINES_PER_SLIDE} lines each.
 * If `ref` is set, it appears as the **last line** on the **last** slide of this passage only.
 * Continuation slides contain verse lines only (no reference).
 */
export function partitionVerseSlideLines(
  verseLines: string[],
  reference: string | undefined,
): string[][] {
  const ref = reference?.trim();

  if (!ref) {
    return chunkLines(verseLines, MAX_VERSE_LINES_PER_SLIDE);
  }

  if (verseLines.length === 0) {
    return [[ref]];
  }

  const slides: string[][] = [];
  let i = 0;
  while (i < verseLines.length) {
    const left = verseLines.length - i;

    if (left <= 3) {
      slides.push([...verseLines.slice(i), ref]);
      break;
    }

    if (left === 4) {
      slides.push(verseLines.slice(i, i + 3));
      slides.push([verseLines[i + 3]!, ref]);
      break;
    }

    slides.push(verseLines.slice(i, i + MAX_VERSE_LINES_PER_SLIDE));
    i += MAX_VERSE_LINES_PER_SLIDE;
  }

  return slides;
}

function chunkLines(lines: string[], size: number): string[][] {
  const out: string[][] = [];
  for (let i = 0; i < lines.length; i += size) {
    out.push(lines.slice(i, i + size));
  }
  return out.length > 0 ? out : [];
}
