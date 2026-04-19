import { z } from "zod";

/** Block-level classification used in review and when building slides. */
export const sermonBlockTypeSchema = z.enum([
  "title",
  "verse_reference",
  "verse_text",
  "main_point",
  "sub_point",
  "quote",
  "prayer",
  "closing",
  "notes",
  "unknown",
]);

export const sermonBlockSchema = z.object({
  id: z.string().uuid(),
  type: sermonBlockTypeSchema,
  text: z.string(),
  order: z.number().int().nonnegative(),
  confidence: z.number().min(0).max(1).optional(),
});

export const sermonSourceSchema = z.enum(["docx", "pdf"]);

export const sermonMetadataSchema = z.object({
  fileName: z.string(),
  pageCount: z.number().int().positive().optional(),
  parserVersion: z.string(),
});

export const sermonSectionSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  paragraphs: z.array(
    z.object({
      text: z.string(),
      page: z.number().int().positive().optional(),
    }),
  ),
});

export const sermonDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  source: sermonSourceSchema,
  importedAt: z.string(),
  rawText: z.string(),
  sections: z.array(sermonSectionSchema).optional(),
  blocks: z.array(sermonBlockSchema),
  metadata: sermonMetadataSchema,
});

export const slideLayoutSchema = z.enum([
  "title",
  "point",
  "verse",
  "quote",
  "closing",
]);

export const slideModelSchema = z.object({
  id: z.string(),
  layout: slideLayoutSchema,
  lines: z.array(z.string()),
  speakerNotes: z.string().optional(),
  refs: z.array(z.string()).optional(),
});

export const propresenterBindingSchema = z.object({
  presentationId: z.string(),
  slideIndex: z.number().int().nonnegative(),
  slideId: z.string().optional(),
  sermonSlideId: z.string(),
  lastSyncedAt: z.string().optional(),
});

export const presentationModelSchema = z.object({
  id: z.string(),
  themeId: z.string(),
  slides: z.array(slideModelSchema),
  bindings: z.array(propresenterBindingSchema).optional(),
});

export type SermonBlockType = z.infer<typeof sermonBlockTypeSchema>;
export type SermonBlock = z.infer<typeof sermonBlockSchema>;
export type SermonSource = z.infer<typeof sermonSourceSchema>;
export type SermonMetadata = z.infer<typeof sermonMetadataSchema>;
export type SermonSection = z.infer<typeof sermonSectionSchema>;
export type SermonDocument = z.infer<typeof sermonDocumentSchema>;
export type SlideLayout = z.infer<typeof slideLayoutSchema>;
export type SlideModel = z.infer<typeof slideModelSchema>;
export type ProPresenterBinding = z.infer<typeof propresenterBindingSchema>;
export type PresentationModel = z.infer<typeof presentationModelSchema>;
