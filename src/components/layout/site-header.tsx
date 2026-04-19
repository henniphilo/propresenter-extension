"use client";

import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/cn";

const links = [
  { href: "/", label: "Home" },
  { href: "/import", label: "Import" },
  { href: "/review", label: "Review" },
  { href: "/live", label: "Live" },
  { href: "/settings", label: "Settings" },
];

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5 lg:max-w-none">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Sermon Studio
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              {l.label}
            </Link>
          ))}
          <ThemeToggle className="ml-2" />
        </nav>
      </div>
    </header>
  );
}
