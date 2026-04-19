"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  loadPpBaseUrl,
  loadPpPresentationId,
  loadPresentation,
} from "@/lib/client/storage";
import type { PresentationModel, SlideModel } from "@/lib/domain";
import { cn } from "@/lib/cn";

type ProPresenterStatusPayload = {
  connected?: boolean;
  activePresentationId?: string;
  activeSlideIndex?: number;
};

async function ppPost(payload: Record<string, unknown>) {
  const baseUrl = loadPpBaseUrl();
  const res = await fetch("/api/propresenter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, baseUrl }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error?.message ?? "ProPresenter request failed");
  }
  return json;
}

export function LiveWorkspace() {
  const [presentation, setPresentation] = useState<PresentationModel | null>(null);
  const [status, setStatus] = useState<ProPresenterStatusPayload | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPresentation(loadPresentation());
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const baseUrl = loadPpBaseUrl();
      const qs = baseUrl ? `?baseUrl=${encodeURIComponent(baseUrl)}` : "";
      const res = await fetch(`/api/propresenter${qs}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message ?? "Status failed");
      }
      setStatus(json.status as ProPresenterStatusPayload);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Status failed");
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
    const id = window.setInterval(() => void refreshStatus(), 4000);
    return () => window.clearInterval(id);
  }, [refreshStatus]);

  const presentationId = loadPpPresentationId();

  const filtered = useMemo(() => {
    const slides = presentation?.slides ?? [];
    const q = query.trim().toLowerCase();
    if (!q) {
      return slides.map((s, idx) => ({ slide: s, index: idx }));
    }
    return slides
      .map((s, idx) => ({ slide: s, index: idx }))
      .filter(({ slide }) =>
        slide.lines.join(" ").toLowerCase().includes(q),
      );
  }, [presentation, query]);

  const triggerSlide = async (index: number, mode: "preview" | "air") => {
    try {
      const pid = loadPpPresentationId();
      if (mode === "air") {
        await ppPost({
          action: "triggerPresentation",
          presentationId: pid,
        });
      }
      await ppPost({
        action: "triggerSlide",
        presentationId: pid,
        slideIndex: index,
      });
      await refreshStatus();
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    }
  };

  const stageText = async (text: string) => {
    try {
      await ppPost({ action: "showStageMessage", text });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Stage message failed");
    }
  };

  const navSlide = async (dir: "next" | "prev") => {
    try {
      await ppPost({ action: dir === "next" ? "nextSlide" : "previousSlide" });
      await refreshStatus();
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Navigation failed");
    }
  };

  const showFirstLayout = async (layout: SlideModel["layout"]) => {
    const idx = (presentation?.slides ?? []).findIndex((s) => s.layout === layout);
    if (idx >= 0) {
      await triggerSlide(idx, "preview");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => navSlide("prev")}
          className="rounded-2xl bg-zinc-900 px-8 py-5 text-lg font-semibold text-white dark:bg-white dark:text-zinc-950"
        >
          Previous slide
        </button>
        <button
          type="button"
          onClick={() => navSlide("next")}
          className="rounded-2xl bg-zinc-900 px-8 py-5 text-lg font-semibold text-white dark:bg-white dark:text-zinc-950"
        >
          Next slide
        </button>
        <button
          type="button"
          onClick={() => void showFirstLayout("verse")}
          className="rounded-2xl border border-zinc-300 px-6 py-5 text-lg font-semibold dark:border-zinc-700"
        >
          Show verse
        </button>
        <button
          type="button"
          onClick={() => void showFirstLayout("point")}
          className="rounded-2xl border border-zinc-300 px-6 py-5 text-lg font-semibold dark:border-zinc-700"
        >
          Show point
        </button>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Live status
            </p>
            <p className="mt-1 text-lg font-semibold">
              {status?.connected ? "Connected (session)" : "Disconnected"}
              {typeof status?.activeSlideIndex === "number"
                ? ` · Slide ${status.activeSlideIndex + 1}`
                : null}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refreshStatus()}
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold dark:border-zinc-700"
          >
            Refresh
          </button>
        </div>
      </div>

      <label className="block max-w-xl">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Search slides
        </span>
        <input
          className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-lg dark:border-zinc-700 dark:bg-zinc-950"
          placeholder="Filter by text…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      {!presentation ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="font-semibold">No slide deck yet.</p>
          <p className="mt-2 text-sm opacity-90">
            Run <strong>Rebuild slides</strong> from Review after importing a sermon.
          </p>
          <Link
            href="/review"
            className="mt-4 inline-flex rounded-xl bg-amber-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Go to Review
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {filtered.map(({ slide, index }) => {
            const active =
              typeof status?.activeSlideIndex === "number" &&
              status.activeSlideIndex === index &&
              status.activePresentationId === presentationId;
            const focus = slide.refs?.[0];
            return (
              <li
                key={slide.id}
                className={cn(
                  "rounded-2xl border p-5 transition",
                  active
                    ? "border-emerald-500 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/30"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      {slide.layout} · Slide {index + 1}
                      {active ? (
                        <span className="ml-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          Live
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-2 text-xl font-semibold leading-snug">
                      {slide.lines.join(" · ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void triggerSlide(index, "preview")}
                      className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => void triggerSlide(index, "air")}
                      className="rounded-xl border border-emerald-600 px-4 py-3 text-sm font-semibold text-emerald-900 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-100 dark:hover:bg-emerald-950/40"
                    >
                      On Air
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void stageText(slide.lines.join("\n")).catch(() => undefined)
                      }
                      className="rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold dark:border-zinc-700"
                    >
                      Stage message
                    </button>
                    {focus ? (
                      <Link
                        href={`/review?focus=${focus}`}
                        className="rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold dark:border-zinc-700"
                      >
                        Edit
                      </Link>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100">
          {error}
        </p>
      ) : null}
    </div>
  );
}
