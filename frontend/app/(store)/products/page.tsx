import { Suspense } from "react";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductFilters } from "@/components/store/ProductFilters";
import { api } from "@/lib/api";

export const metadata = { title: "Products" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const [products, categories, brands] = await Promise.all([
    api
      .products({
        q: sp.q,
        category: sp.category,
        brand: sp.brand,
        color: sp.color,
        material: sp.material,
        finish: sp.finish,
        minPrice: sp.minPrice,
        maxPrice: sp.maxPrice,
        availability: sp.availability,
        sort: sp.sort || "newest",
        page: sp.page || 1,
        limit: 24,
      })
      .catch(() => ({
        items: [],
        total: 0,
        page: 1,
        limit: 24,
        facets: { colors: [], materials: [], finishes: [] },
      })),
    api.categories().catch(() => []),
    api.brands().catch(() => []),
  ]);

  return (
    <div className="container-page py-8 md:py-16">
      <div className="mb-6 md:mb-8">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">Products</h1>
        <p className="mt-2 text-sm text-muted md:mt-3 md:text-base">{products.total} results</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-10">
        <Suspense fallback={<div />}>
          <ProductFilters
            categories={categories}
            brands={brands}
            facets={products.facets || { colors: [], materials: [], finishes: [] }}
          />
        </Suspense>
        <div className="min-w-0">
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
            {products.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {products.items.length === 0 && (
            <p className="text-muted">No products match your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}
