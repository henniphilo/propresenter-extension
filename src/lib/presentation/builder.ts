import type {
  PresentationModel,
  SermonBlock,
  SermonBlockType,
  SermonDocument,
  SlideLayout,
  SlideModel,
} from "@/lib/domain";
import { presentationModelSchema } from "@/lib/domain";

import { segmentsFromBlocks } from "@/lib/presentation/block-segments";
import type { PresentationTheme } from "@/lib/presentation/theme";
import { DEFAULT_THEME_ID } from "@/lib/presentation/theme";
import {
  VERSE_WRAP_CHARS,
  partitionVerseSlideLines,
  verseBodyToLines,
} from "@/lib/presentation/verse-layout";

function newId(): string {
  return crypto.randomUUID();
}

function slideLayoutForBlock(type: SermonBlockType): SlideLayout | null {
  switch (type) {
    case "title":
      return "title";
    case "main_point":
    case "sub_point":
      return "point";
    case "verse_reference":
    case "verse_text":
      return "verse";
    case "quote":
      return "quote";
    case "prayer":
    case "closing":
      return "closing";
    case "notes":
      return null;
    default:
      return "point";
  }
}

function linesForBlock(block: SermonBlock, sermonTitle: string): string[] {
  switch (block.type) {
    case "title":
      return [block.text || sermonTitle];
    case "verse_reference":
      return [block.text];
    case "verse_text":
      return [block.text];
    case "main_point":
    case "sub_point":
      return [block.text];
    case "quote":
      return [block.text];
    case "prayer":
    case "closing":
      return [block.text];
    case "notes":
      return [block.text];
    default:
      return [block.text];
  }
}

export function blockToSlide(
  block: SermonBlock,
  sermon: SermonDocument,
): SlideModel | null {
  const layout = slideLayoutForBlock(block.type);
  if (!layout) {
    return null;
  }
  const speakerNotes = block.type === "notes" ? block.text : undefined;
  const lines = linesForBlock(block, sermon.title);
  return {
    id: newId(),
    layout,
    lines,
    speakerNotes,
    refs: [block.id],
  };
}

/** Build slides from ordered blocks; attaches notes-only content to previous slide when possible. */
export function buildPresentation(
  sermon: SermonDocument,
  theme: PresentationTheme,
): PresentationModel {
  const slides: SlideModel[] = [];
  let pendingNotes: string | undefined;

  const sorted = [...sermon.blocks].sort((a, b) => a.order - b.order);
  const segments = segmentsFromBlocks(sorted);

  const attachPendingNotes = (slide: SlideModel) => {
    if (pendingNotes) {
      slide.speakerNotes = slide.speakerNotes
        ? `${slide.speakerNotes}\n\n${pendingNotes}`
        : pendingNotes;
      pendingNotes = undefined;
    }
  };

  for (const segment of segments) {
    if (segment.kind === "verse") {
      const verseLines = verseBodyToLines(segment.body, VERSE_WRAP_CHARS);
      const partitioned = partitionVerseSlideLines(verseLines, segment.reference);

      let first = true;
      for (const slideLines of partitioned) {
        if (slideLines.length === 0) {
          continue;
        }
        const slide: SlideModel = {
          id: newId(),
          layout: "verse",
          lines: slideLines,
          refs: segment.refs,
        };
        if (first) {
          attachPendingNotes(slide);
          first = false;
        }
        slides.push(slide);
      }
      continue;
    }

    const block = segment.block;

    if (block.type === "notes") {
      pendingNotes = pendingNotes
        ? `${pendingNotes}\n\n${block.text}`
        : block.text;
      continue;
    }

    const slide = blockToSlide(block, sermon);
    if (!slide) {
      continue;
    }

    attachPendingNotes(slide);
    slides.push(slide);
  }

  if (pendingNotes && slides.length > 0) {
    const last = slides[slides.length - 1]!;
    last.speakerNotes = last.speakerNotes
      ? `${last.speakerNotes}\n\n${pendingNotes}`
      : pendingNotes;
  } else if (pendingNotes) {
    slides.push({
      id: newId(),
      layout: "closing",
      lines: ["Speaker notes"],
      speakerNotes: pendingNotes,
      refs: [],
    });
  }

  const model: PresentationModel = {
    id: `presentation-${sermon.id}`,
    themeId: theme.id ?? DEFAULT_THEME_ID,
    slides,
  };

  return presentationModelSchema.parse(model);
}
