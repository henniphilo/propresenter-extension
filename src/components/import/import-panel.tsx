"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { saveSermon } from "@/lib/client/storage";
import { loadDemoSermon } from "@/lib/demo";
import type { SermonDocument } from "@/lib/domain";
import { cn } from "@/lib/cn";

export function ImportPanel() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const persistAndGo = useCallback(
    (doc: SermonDocument) => {
      saveSermon(doc);
      router.push("/review");
    },
    [router],
  );

  const uploadFile = async (file: File) => {
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/import", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message ?? "Import failed");
      }
      persistAndGo(json.document as SermonDocument);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void uploadFile(file);
    }
  };

  return (
    <div className="space-y-6">
      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "rounded-2xl border-2 border-dashed px-8 py-16 text-center transition",
          dragOver
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
            : "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/40",
        )}
      >
        <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          Drop a Word (.docx) or PDF file here
        </p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Text is extracted on your machine via the local server — nothing is uploaded to the cloud.
        </p>
        <label className="mt-8 inline-flex cursor-pointer rounded-xl bg-zinc-900 px-6 py-3 text-base font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
          Choose file
          <input
            type="file"
            accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                void uploadFile(file);
              }
            }}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            try {
              const doc = loadDemoSermon();
              persistAndGo(doc);
            } catch {
              setError("Could not load demo data.");
            }
          }}
          className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Load demo sermon
        </button>
        {busy ? <span className="text-sm text-zinc-600 dark:text-zinc-400">Working…</span> : null}
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100">
          {error}
        </p>
      ) : null}
    </div>
  );
}
