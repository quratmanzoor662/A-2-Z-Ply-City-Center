import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/store/ProductDetail";
import { api } from "@/lib/api";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product;
  try {
    product = await api.product(slug);
  } catch {
    notFound();
  }
  const [similar, settings] = await Promise.all([
    api.similar(slug).catch(() => []),
    api.settings().catch(() => ({ whatsappNumber: "919320630345" })),
  ]);

  return (
    <ProductDetail
      product={product}
      similar={similar}
      whatsappNumber={settings.whatsappNumber || "919320630345"}
    />
  );
}
