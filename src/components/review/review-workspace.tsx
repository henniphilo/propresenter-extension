"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { SortableBlockCard } from "@/components/review/sortable-block-card";
import { savePresentation, saveSermon } from "@/lib/client/storage";
import type { SermonBlock, SermonBlockType, SermonDocument } from "@/lib/domain";
import { buildPresentation } from "@/lib/presentation";
import { defaultPresentationTheme } from "@/lib/presentation/theme";
import { cn } from "@/lib/cn";

export function ReviewWorkspace({ initial }: { initial: SermonDocument | null }) {
  const [doc, setDoc] = useState<SermonDocument | null>(initial);
  const [savedHint, setSavedHint] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFocusId(params.get("focus"));
  }, []);

  useEffect(() => {
    setDoc(initial);
  }, [initial]);

  const sortedBlocks = useMemo(() => {
    if (!doc) {
      return [];
    }
    return [...doc.blocks].sort((a, b) => a.order - b.order);
  }, [doc]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const persist = useCallback(
    (next: SermonDocument) => {
      setDoc(next);
      saveSermon(next);
      setSavedHint("Saved");
      window.setTimeout(() => setSavedHint(null), 1500);
    },
    [],
  );

  const updateBlock = useCallback(
    (id: string, fn: (b: SermonBlock) => SermonBlock) => {
      if (!doc) {
        return;
      }
      const blocks = doc.blocks.map((b) => (b.id === id ? fn(b) : b));
      persist({ ...doc, blocks });
    },
    [doc, persist],
  );

  const onDragEnd = (event: DragEndEvent) => {
    if (!doc) {
      return;
    }
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = sortedBlocks.findIndex((b) => b.id === active.id);
    const newIndex = sortedBlocks.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }
    const reordered = arrayMove(sortedBlocks, oldIndex, newIndex).map((b, idx) => ({
      ...b,
      order: idx,
    }));
    persist({ ...doc, blocks: reordered });
  };

  const rebuildPresentation = useCallback(() => {
    if (!doc) {
      return;
    }
    const presentation = buildPresentation(doc, defaultPresentationTheme);
    savePresentation(presentation);
    setSavedHint("Slides rebuilt");
    window.setTimeout(() => setSavedHint(null), 1500);
  }, [doc]);

  const exportPptx = useCallback(async () => {
    if (!doc) {
      return;
    }
    const presentation = buildPresentation(doc, defaultPresentationTheme);
    savePresentation(presentation);
    const res = await fetch("/api/export/pptx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presentation, theme: defaultPresentationTheme }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j?.error?.message ?? "Export failed");
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${presentation.id}.pptx`;
    a.click();
    URL.revokeObjectURL(url);
  }, [doc]);

  if (!doc) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-lg font-medium">No sermon loaded yet.</p>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Import a document first, then fine-tune structure here.
        </p>
        <Link
          href="/import"
          className="mt-6 inline-flex rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
        >
          Go to Import
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => persist(doc)}
          className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
        >
          Save
        </button>
        <button
          type="button"
          onClick={rebuildPresentation}
          className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Rebuild slides
        </button>
        <button
          type="button"
          onClick={() => void exportPptx().catch(() => alert("Export failed"))}
          className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Export PPTX
        </button>
        <Link
          href="/live"
          className="rounded-xl border border-emerald-600 px-5 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-200 dark:hover:bg-emerald-950/40"
        >
          Live control
        </Link>
        {savedHint ? (
          <span className="text-sm text-emerald-700 dark:text-emerald-300">{savedHint}</span>
        ) : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Original text
          </h2>
          <pre
            className={cn(
              "mt-3 max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-base leading-relaxed text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100",
            )}
          >
            {doc.rawText}
          </pre>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Recognized blocks
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Drag to reorder, adjust types, and edit copy. Rebuild slides before presenting or
            exporting.
          </p>
          <div className="mt-4 space-y-3">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={sortedBlocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortedBlocks.map((block) => (
                  <div
                    key={block.id}
                    id={block.id}
                    className={cn(
                      focusId === block.id &&
                        "scroll-mt-28 ring-2 ring-emerald-500/60 ring-offset-4 ring-offset-white dark:ring-offset-zinc-950",
                    )}
                  >
                    <SortableBlockCard
                      block={block}
                      onChangeText={(text) => updateBlock(block.id, (b) => ({ ...b, text }))}
                      onChangeType={(type) =>
                        updateBlock(block.id, (b) => ({ ...b, type: type as SermonBlockType }))
                      }
                    />
                  </div>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </section>
      </div>
    </div>
  );
}
