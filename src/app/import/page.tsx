import { ImportPanel } from "@/components/import/import-panel";

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Import manuscript
      </h1>
      <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
        Bring in a Word document or PDF. We extract text locally and propose a sermon outline you can
        refine.
      </p>
      <div className="mt-10">
        <ImportPanel />
      </div>
    </div>
  );
}
