"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type Facets = {
  colors: string[];
  materials: string[];
  finishes: string[];
};

type Props = {
  categories: { slug: string; name: string }[];
  brands: { slug: string; name: string }[];
  facets: Facets;
};

export function ProductFilters({ categories, brands, facets }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  }

  const field = (label: string, key: string, options: { value: string; label: string }[]) => (
    <div>
      <label className="mb-2 block text-sm font-semibold">{label}</label>
      <select
        className="select"
        value={searchParams.get(key) || ""}
        onChange={(e) => update(key, e.target.value)}
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <aside className={`${pending ? "opacity-70" : ""}`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5">
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="mb-2 block text-sm font-semibold">Search</label>
          <input
            className="input"
            defaultValue={searchParams.get("q") || ""}
            placeholder="Search…"
            onKeyDown={(e) => {
              if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value);
            }}
          />
        </div>
        {field(
          "Category",
          "category",
          categories.map((c) => ({ value: c.slug, label: c.name })),
        )}
        {field(
          "Brand",
          "brand",
          brands.map((b) => ({ value: b.slug, label: b.name })),
        )}
        <div>
          <label className="mb-2 block text-sm font-semibold">Min price</label>
          <input
            type="number"
            className="input"
            defaultValue={searchParams.get("minPrice") || ""}
            onBlur={(e) => update("minPrice", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Max price</label>
          <input
            type="number"
            className="input"
            defaultValue={searchParams.get("maxPrice") || ""}
            onBlur={(e) => update("maxPrice", e.target.value)}
          />
        </div>
        {field(
          "Color",
          "color",
          facets.colors.map((c) => ({ value: c, label: c })),
        )}
        {field(
          "Material",
          "material",
          facets.materials.map((c) => ({ value: c, label: c })),
        )}
        {field(
          "Finish",
          "finish",
          facets.finishes.map((c) => ({ value: c, label: c })),
        )}
        {field("Availability", "availability", [
          { value: "in_stock", label: "In stock" },
          { value: "out_of_stock", label: "Out of stock" },
        ])}
        {field("Sort by", "sort", [
          { value: "newest", label: "Newest" },
          { value: "popular", label: "Popular" },
          { value: "price_asc", label: "Price: Low to High" },
          { value: "price_desc", label: "Price: High to Low" },
        ])}
      </div>
    </aside>
  );
}
