import Link from "next/link";
import type { StoreSettings } from "@/lib/types";

export function Footer({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="mt-12 border-t border-line bg-white/70 md:mt-20">
      <div className="container-page grid gap-8 py-10 md:grid-cols-3 md:gap-10 md:py-14">
        <div>
          <p className="font-display text-xl font-semibold md:text-2xl">{settings.storeName}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{settings.tagline}</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Explore</p>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link href="/categories">Categories</Link>
            <Link href="/products">All Products</Link>
            <Link href="/products?sort=newest">New Arrivals</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Visit</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">{settings.address}</p>
          <p className="mt-2 text-sm text-muted">{settings.openingHours}</p>
          <p className="mt-2 text-sm">{settings.phone}</p>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
      </div>
    </footer>
  );
}
