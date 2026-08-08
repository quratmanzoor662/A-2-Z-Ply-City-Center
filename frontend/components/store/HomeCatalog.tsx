"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HeroBanner } from "@/components/store/HeroBanner";
import { ProductCard } from "@/components/store/ProductCard";
import { VisitShowroom } from "@/components/store/VisitShowroom";
import { api } from "@/lib/api";
import { fallbackSettings } from "@/lib/fallback";
import type { Banner, Brand, Category, Product, StoreSettings } from "@/lib/types";

type LoadState = "loading" | "ready" | "error";

export function HomeCatalog() {
  const [state, setState] = useState<LoadState>("loading");
  const [settings, setSettings] = useState<StoreSettings>(fallbackSettings);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [arrivals, setArrivals] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, b, c, f, a, br] = await Promise.all([
          api.settings(),
          api.banners(),
          api.categories(),
          api.products({ featured: true, limit: 8 }),
          api.products({ newArrival: true, limit: 8 }),
          api.brands(),
        ]);
        if (cancelled) return;
        setSettings(s);
        setBanners(b);
        setCategories(c);
        setFeatured(f.items);
        setArrivals(a.items);
        setBrands(br);
        setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const testimonials = [
    {
      quote: "Best plywood selection in the city. Quality matched what they recommended.",
      name: "Rahul Mehta",
    },
    {
      quote: "Laminate options and hardware under one roof saved us multiple store visits.",
      name: "Sana Khan",
    },
    {
      quote: "Helpful team and clear pricing. Perfect for our interior project.",
      name: "Amit Joshi",
    },
  ];

  if (state === "loading") {
    return (
      <div className="container-page py-24 text-center text-muted">
        Loading showroom…
      </div>
    );
  }

  return (
    <>
      {state === "error" && (
        <div className="border-b border-accent/30 bg-[#fff8ef] px-4 py-3 text-center text-sm text-ink">
          Could not reach the catalog API. Check{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs">NEXT_PUBLIC_API_URL</code> on
          Vercel.
        </div>
      )}

      <HeroBanner banners={banners} brand={settings.storeName} />

      {arrivals.length > 0 && (
        <section className="container-page py-12 md:py-20">
          <div className="mb-6 flex items-end justify-between gap-3 md:mb-10 md:gap-4">
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-semibold md:text-4xl">New Arrivals</h2>
              <p className="mt-2 text-sm text-muted md:mt-3 md:text-base">
                Fresh textures and hardware just in.
              </p>
            </div>
            <Link href="/products?sort=newest" className="shrink-0 text-sm font-semibold text-primary">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {arrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="container-page py-8 md:py-10">
          <div className="mb-6 flex items-end justify-between gap-3 md:mb-10 md:gap-4">
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-semibold md:text-4xl">Best Selling</h2>
              <p className="mt-2 text-sm text-muted md:mt-3 md:text-base">
                Popular picks from our showroom floor.
              </p>
            </div>
            <Link href="/products?sort=popular" className="shrink-0 text-sm font-semibold text-primary">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="container-page py-12 md:py-20">
          <div className="mb-6 max-w-2xl md:mb-10">
            <h2 className="font-display text-2xl font-semibold md:text-4xl">Featured Categories</h2>
            <p className="mt-2 text-sm text-muted md:mt-3 md:text-base">
              Browse materials and fittings organised the way showrooms work.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5">
            {categories.slice(0, 10).map((cat) => (
              <Link key={cat.id} href={`/categories/${cat.slug}`} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-white">
                  {cat.image?.url && (
                    <Image
                      src={cat.image.url}
                      alt={cat.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width:768px) 50vw, 20vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  <p className="absolute bottom-2 left-2 right-2 text-sm font-medium text-white md:bottom-3 md:left-3 md:right-3 md:text-base">
                    {cat.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {brands.length > 0 && (
        <section className="border-y border-line bg-white/60 py-16">
          <div className="container-page">
            <h2 className="font-display text-3xl font-semibold md:text-4xl">Featured Brands</h2>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center gap-3 bg-bg px-4 py-5">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white">
                    {brand.logo?.url && (
                      <Image src={brand.logo.url} alt={brand.name} fill className="object-cover" sizes="48px" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{brand.name}</p>
                    <p className="line-clamp-1 text-xs text-muted">{brand.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container-page py-20">
        <h2 className="font-display text-3xl font-semibold md:text-4xl">Why Choose Us</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            ["Curated Quality", "Sheets, laminates, and fittings selected for lasting interiors."],
            ["Showroom Expertise", "Guidance on thickness, finish, and hardware matching."],
            ["One-Stop Destination", "From plywood to plumbing essentials under one roof."],
          ].map(([title, copy]) => (
            <div key={title}>
              <h3 className="font-display text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary text-white">
        <div className="container-page py-16">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">Customer Stories</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote key={t.name} className="border border-white/20 bg-white/5 p-6">
                <p className="text-sm leading-relaxed text-white/90">“{t.quote}”</p>
                <footer className="mt-4 text-sm font-semibold">{t.name}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <VisitShowroom settings={settings} />
    </>
  );
}
