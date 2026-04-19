import { LiveWorkspace } from "@/components/live/live-workspace";

export default function LivePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Live control
      </h1>
      <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
        Drive ProPresenter through the local API proxy. Configure the base URL in Settings if you are
        testing against a real installation.
      </p>
      <div className="mt-10">
        <LiveWorkspace />
      </div>
    </div>
  );
}
