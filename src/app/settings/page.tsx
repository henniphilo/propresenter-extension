"use client";

import { useEffect, useState } from "react";

import {
  loadPpBaseUrl,
  loadPpPresentationId,
  savePpBaseUrl,
  savePpPresentationId,
} from "@/lib/client/storage";

export default function SettingsPage() {
  const [baseUrl, setBaseUrl] = useState("");
  const [presentationId, setPresentationId] = useState("pres-sermon");
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    setBaseUrl(loadPpBaseUrl() ?? "");
    setPresentationId(loadPpPresentationId());
  }, []);

  const save = () => {
    savePpBaseUrl(baseUrl.trim());
    savePpPresentationId(presentationId.trim() || "pres-sermon");
    setHint("Saved");
    window.setTimeout(() => setHint(null), 1500);
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Settings
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Optional ProPresenter REST base URL (leave empty to use the built-in mock client). Match the
        value from ProPresenter Network preferences and the official OpenAPI docs for your version.
      </p>

      <form
        className="mt-10 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            ProPresenter base URL
          </span>
          <input
            className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="http://127.0.0.1:50001"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Presentation ID for slide triggers
          </span>
          <input
            className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="pres-sermon"
            value={presentationId}
            onChange={(e) => setPresentationId(e.target.value)}
          />
        </label>
        <button
          type="submit"
          className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
        >
          Save settings
        </button>
        {hint ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-300">{hint}</p>
        ) : null}
      </form>

      <p className="mt-10 text-sm text-zinc-500">
        Environment override: set <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">PROPRESENTER_BASE_URL</code>{" "}
        on the Next.js server to default every session to HTTP mode. Use{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">PROPRESENTER_USE_MOCK=true</code> to force the mock.
      </p>
    </div>
  );
}
