import Link from "next/link";

const steps = [
  {
    title: "Import",
    body: "Upload a .docx or .pdf manuscript. Text stays on your Mac via the local Next.js server.",
    href: "/import",
  },
  {
    title: "Review",
    body: "Correct titles, verses, points, and quotes. Drag blocks into the right flow for Sunday.",
    href: "/review",
  },
  {
    title: "Live",
    body: "Trigger slides and stage messages through the ProPresenter service layer — mock by default.",
    href: "/live",
  },
];

export default function HomePage() {
  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
          macOS-first · Local · JSON source of truth
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Calm sermon preparation for teams on Sunday morning.
        </h1>
        <p className="mt-6 text-xl leading-relaxed text-zinc-600 dark:text-zinc-400">
          Turn manuscripts into structured slides, optionally export PowerPoint, and drive ProPresenter
          without wrestling with giant slide decks mid-service.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="rounded-3xl border border-zinc-200 bg-white p-8 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              {s.title}
            </p>
            <p className="mt-4 text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">{s.body}</p>
            <span className="mt-6 inline-flex text-sm font-semibold text-zinc-900 dark:text-white">
              Open →
            </span>
          </Link>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-3xl rounded-3xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          Internal structure is JSON — PowerPoint is only an export adapter.
        </p>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Same model will feed Keynote or native presentation tooling later without migrating your
          sermon data.
        </p>
      </div>
    </div>
  );
}
