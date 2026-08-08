"use client";

import { useEffect, useState } from "react";
import { ProductDetail } from "@/components/store/ProductDetail";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

export function ClientProductDetail({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [whatsapp, setWhatsapp] = useState("919320630345");
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, s, settings] = await Promise.all([
          api.product(slug),
          api.similar(slug).catch(() => []),
          api.settings().catch(() => ({ whatsappNumber: "919320630345" })),
        ]);
        if (cancelled) return;
        setProduct(p);
        setSimilar(s);
        setWhatsapp(settings.whatsappNumber || "919320630345");
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) {
    return <div className="container-page py-16 text-muted">Product not found.</div>;
  }
  if (!product) {
    return <div className="container-page py-16 text-muted">Loading product…</div>;
  }

  return <ProductDetail product={product} similar={similar} whatsappNumber={whatsapp} />;
}
