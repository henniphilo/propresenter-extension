import PptxGenJS from "pptxgenjs";

import type { PresentationModel } from "@/lib/domain";

import type { PresentationTheme } from "@/lib/presentation/theme";

function layoutPlacement(
  layout: PresentationModel["slides"][number]["layout"],
  theme: PresentationTheme,
): { fontSize: number; fontFace: string; bold?: boolean } {
  switch (layout) {
    case "title":
      return {
        fontSize: theme.sizes.titlePt,
        fontFace: theme.fonts.titleFace,
        bold: true,
      };
    case "verse":
      return {
        fontSize: theme.sizes.versePt,
        fontFace: theme.fonts.verseFace,
      };
    case "quote":
      return {
        fontSize: theme.sizes.quotePt,
        fontFace: theme.fonts.bodyFace,
      };
    default:
      return {
        fontSize: theme.sizes.bodyPt,
        fontFace: theme.fonts.bodyFace,
      };
  }
}

/** Serialize slide model to PPTX bytes (simple, editable slides). */
export async function presentationToPptxBuffer(
  presentation: PresentationModel,
  theme: PresentationTheme,
): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "SERMON", width: 13.333, height: 7.5 });
  pptx.layout = "SERMON";

  const contentWidth =
    13.333 - theme.margins.xIn * 2 > 0 ? 13.333 - theme.margins.xIn * 2 : 12;
  const slideHeight = 7.5 - theme.margins.yIn * 2 > 0 ? 7.5 - theme.margins.yIn * 2 : 6.5;

  for (const slide of presentation.slides) {
    const s = pptx.addSlide();
    s.background = { type: "none" };

    const placement = layoutPlacement(slide.layout, theme);
    const body = slide.lines.join("\n");

    s.addText(body, {
      x: theme.margins.xIn,
      y: theme.margins.yIn,
      w: contentWidth,
      h: slideHeight,
      fontSize: placement.fontSize,
      fontFace: placement.fontFace,
      bold: placement.bold,
      align: "center",
      valign: "middle",
      color: "000000",
      lineSpacingMultiple: theme.spacing.line,
    });

    if (slide.speakerNotes?.trim()) {
      s.addNotes(slide.speakerNotes.trim());
    }
  }

  const out = await pptx.write({ outputType: "nodebuffer" });
  return Buffer.from(out as Uint8Array);
}
