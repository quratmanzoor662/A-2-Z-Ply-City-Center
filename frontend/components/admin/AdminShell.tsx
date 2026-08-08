"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { api } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/brands", label: "Brands" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) {
      setReady(true);
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    api
      .me(token)
      .then(() => setReady(true))
      .catch(() => {
        clearToken();
        router.replace("/admin/login");
      });
  }, [isLogin, router, pathname]);

  if (isLogin) return <>{children}</>;
  if (!ready) {
    return <div className="admin-shell flex min-h-screen items-center justify-center text-muted">Loading…</div>;
  }

  return (
    <div className="admin-shell min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-white md:min-h-screen md:border-b-0 md:border-r">
        <div className="px-5 py-6">
          <p className="font-display text-xl font-semibold">A-2-Z Admin</p>
          <p className="mt-1 text-xs text-muted">Catalog management</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 md:flex-col md:overflow-visible">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "rounded-lg px-3 py-2 text-sm whitespace-nowrap",
                pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                  ? "bg-primary text-white"
                  : "text-ink hover:bg-bg",
              )}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            className="mt-2 rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-bg"
            onClick={() => {
              clearToken();
              router.push("/admin/login");
            }}
          >
            Log out
          </button>
        </nav>
      </aside>
      <div className="p-4 md:p-8">{children}</div>
    </div>
  );
}
