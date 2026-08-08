import { notFound } from "next/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import { api } from "@/lib/api";

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let category;
  try {
    category = await api.category(slug);
  } catch {
    notFound();
  }
  const products = await api.products({ category: slug, limit: 48 }).catch(() => ({ items: [], total: 0 }));

  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="font-display text-4xl font-semibold">{category.name}</h1>
      <p className="mt-3 max-w-2xl text-muted">{category.description}</p>
      <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {products.items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {products.items.length === 0 && <p className="mt-8 text-muted">No products in this category yet.</p>}
    </div>
  );
}
