import type { SermonBlockType } from "@/lib/domain";

export const BLOCK_TYPE_OPTIONS: { value: SermonBlockType; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "verse_reference", label: "Verse reference" },
  { value: "verse_text", label: "Verse text" },
  { value: "main_point", label: "Main point" },
  { value: "sub_point", label: "Sub-point" },
  { value: "quote", label: "Quote" },
  { value: "prayer", label: "Prayer" },
  { value: "closing", label: "Closing" },
  { value: "notes", label: "Speaker notes" },
  { value: "unknown", label: "Unknown" },
];
