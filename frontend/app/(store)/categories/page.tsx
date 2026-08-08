import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await api.categories().catch(() => []);

  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="font-display text-4xl font-semibold">Categories</h1>
      <p className="mt-3 max-w-2xl text-muted">Everything for interiors — organised by material and use.</p>
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/categories/${cat.slug}`} className="group">
            <div className="relative aspect-[4/5] overflow-hidden bg-white">
              {cat.image?.url && (
                <Image
                  src={cat.image.url}
                  alt={cat.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="25vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 p-4 text-white">
                <h2 className="font-display text-xl font-semibold">{cat.name}</h2>
                <p className="mt-1 line-clamp-2 text-xs text-white/80">{cat.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
