import type { SermonDocument } from "@/lib/domain";

/**
 * Optional enrichment hook (e.g. LLM). Default is a no-op passthrough.
 */
export async function enrichSermonDocument(doc: SermonDocument): Promise<SermonDocument> {
  return doc;
}
