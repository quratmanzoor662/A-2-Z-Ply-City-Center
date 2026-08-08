"use client";

import { Suspense, useEffect, useState } from "react";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductFilters } from "@/components/store/ProductFilters";
import { api } from "@/lib/api";
import type { Brand, Category, Product } from "@/lib/types";
import { useSearchParams } from "next/navigation";

function ProductListInner() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [facets, setFacets] = useState({ colors: [] as string[], materials: [] as string[], finishes: [] as string[] });
  const [loading, setLoading] = useState(true);

  const q = searchParams.get("q") || undefined;
  const category = searchParams.get("category") || undefined;
  const brand = searchParams.get("brand") || undefined;
  const color = searchParams.get("color") || undefined;
  const material = searchParams.get("material") || undefined;
  const finish = searchParams.get("finish") || undefined;
  const minPrice = searchParams.get("minPrice") || undefined;
  const maxPrice = searchParams.get("maxPrice") || undefined;
  const availability = searchParams.get("availability") || undefined;
  const sort = searchParams.get("sort") || "newest";
  const page = searchParams.get("page") || "1";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.products({
        q,
        category,
        brand,
        color,
        material,
        finish,
        minPrice,
        maxPrice,
        availability,
        sort,
        page,
        limit: 24,
      }),
      api.categories(),
      api.brands(),
    ])
      .then(([products, cats, brs]) => {
        if (cancelled) return;
        setItems(products.items);
        setTotal(products.total);
        setFacets(products.facets || { colors: [], materials: [], finishes: [] });
        setCategories(cats);
        setBrands(brs);
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q, category, brand, color, material, finish, minPrice, maxPrice, availability, sort, page]);

  return (
    <div className="container-page py-8 md:py-16">
      <div className="mb-6 md:mb-8">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">Products</h1>
        <p className="mt-2 text-sm text-muted md:mt-3 md:text-base">
          {loading ? "Loading…" : `${total} results`}
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-10">
        <ProductFilters categories={categories} brands={brands} facets={facets} />
        <div className="min-w-0">
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {!loading && items.length === 0 && (
            <p className="text-muted">No products match your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ClientProductList() {
  return (
    <Suspense fallback={<div className="container-page py-16 text-muted">Loading products…</div>}>
      <ProductListInner />
    </Suspense>
  );
}
