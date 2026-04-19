"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { SermonBlock, SermonBlockType } from "@/lib/domain";
import { BLOCK_TYPE_OPTIONS } from "@/components/review/block-types";
import { cn } from "@/lib/cn";

export function SortableBlockCard({
  block,
  onChangeText,
  onChangeType,
}: {
  block: SermonBlock;
  onChangeText: (text: string) => void;
  onChangeType: (type: SermonBlockType) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950",
        isDragging && "opacity-70 ring-2 ring-emerald-500/40",
      )}
    >
      <div className="flex flex-wrap items-start gap-3">
        <button
          type="button"
          className="mt-1 cursor-grab rounded-lg border border-zinc-200 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-700"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          Drag
        </button>
        <div className="min-w-0 flex-1 space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Block type
            <select
              className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              value={block.type}
              onChange={(e) => onChangeType(e.target.value as SermonBlockType)}
            >
              {BLOCK_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Text
            <textarea
              className="mt-1 min-h-[96px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-base leading-relaxed text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              value={block.text}
              onChange={(e) => onChangeText(e.target.value)}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
