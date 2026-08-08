"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

const links = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/products", label: "Products" },
  { href: "/#contact", label: "Contact" },
];

export function Header({ storeName }: { storeName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line/80 bg-bg/90 backdrop-blur-md">
      <div className="container-page flex h-14 min-w-0 items-center justify-between gap-3 md:h-20 md:gap-4">
        <Link
          href="/"
          className="font-display min-w-0 flex-1 truncate text-base font-semibold tracking-tight sm:text-lg md:flex-none md:text-2xl"
        >
          {storeName || "A-2-Z Ply City Center"}
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "text-sm font-medium text-muted transition hover:text-ink",
                pathname === link.href && "text-ink",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form
          className="hidden max-w-xs flex-1 items-center gap-2 lg:flex"
          action="/products"
          onSubmit={(e) => {
            if (!q.trim()) e.preventDefault();
          }}
        >
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products"
              className="input pl-9"
            />
          </div>
        </form>

        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="w-full border-t border-line bg-bg px-4 py-4 md:hidden">
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-2 text-base font-medium"
              >
                {link.label}
              </Link>
            ))}
            <form action="/products" className="pt-2">
              <input name="q" placeholder="Search products" className="input" />
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
