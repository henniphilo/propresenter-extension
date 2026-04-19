"use client";

import { useEffect, useState } from "react";

import { ReviewWorkspace } from "@/components/review/review-workspace";
import { loadSermon } from "@/lib/client/storage";
import type { SermonDocument } from "@/lib/domain";

export default function ReviewPage() {
  const [doc, setDoc] = useState<SermonDocument | null>(null);

  useEffect(() => {
    setDoc(loadSermon());
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Review structure
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
        Compare the original text with detected blocks. Drag to reorder, adjust types, then rebuild
        slides before export or live control.
      </p>
      <div className="mt-10">
        <ReviewWorkspace initial={doc} />
      </div>
    </div>
  );
}
