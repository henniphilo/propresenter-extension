import seed from "./seed-sermon.json";
import { sermonDocumentSchema, type SermonDocument } from "@/lib/domain";

export function loadDemoSermon(): SermonDocument {
  return sermonDocumentSchema.parse(seed);
}
