"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGallery } from "@/components/store/ProductGallery";
import { QuoteModal } from "@/components/store/QuoteModal";
import { formatPrice } from "@/lib/api";
import type { Product } from "@/lib/types";

export function ProductDetail({
  product,
  similar,
  whatsappNumber,
}: {
  product: Product;
  similar: Product[];
  whatsappNumber: string;
}) {
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id || "");
  const [quoteOpen, setQuoteOpen] = useState(false);

  const variant = useMemo(
    () => product.variants?.find((v) => v.id === variantId) || product.variants?.[0] || null,
    [product.variants, variantId],
  );

  const images =
    variant?.images?.length ? variant.images : product.images?.length ? product.images : [];
  const price = variant?.sellingPrice ?? product.sellingPrice;
  const mrp = variant?.mrp ?? product.mrp;
  const stock = variant?.stock ?? (product.inStock ? 1 : 0);

  return (
    <div className="container-page py-6 md:py-14">
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <ProductGallery key={variant?.id || "base"} images={images} />
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.16em] text-muted md:text-sm">
            {product.brand?.name || "A-2-Z"} · {product.sku}
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl md:mt-3 md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-3 text-sm text-muted md:mt-4 md:text-base">{product.shortDescription}</p>

          <div className="mt-5 flex flex-wrap items-baseline gap-3 md:mt-6">
            <span className="text-2xl font-semibold md:text-3xl">{formatPrice(price)}</span>
            {mrp > price && <span className="text-base text-muted line-through md:text-lg">{formatPrice(mrp)}</span>}
          </div>
          <p className="mt-2 text-sm text-muted">{stock > 0 ? `${stock} in stock` : "Out of stock"}</p>

          {product.variants?.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold">Select variant</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariantId(v.id)}
                    className={`rounded-full border px-4 py-2 text-sm ${
                      variantId === v.id ? "border-primary bg-primary text-white" : "border-line bg-white"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className="btn btn-accent" onClick={() => setQuoteOpen(true)}>
              Get Quote on WhatsApp
            </button>
            <Link href="/products" className="btn btn-ghost">
              Continue browsing
            </Link>
          </div>

          {product.features && product.features.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold">Features</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
                {product.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {product.specifications?.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold">Specifications</h2>
              <dl className="mt-4 divide-y divide-line border-y border-line">
                {product.specifications.map((s) => (
                  <div key={`${s.key}-${s.value}`} className="grid grid-cols-2 gap-4 py-3 text-sm">
                    <dt className="text-muted">{s.key}</dt>
                    <dd className="font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {product.description && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold">Details</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl font-semibold">Similar Products</h2>
          <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <QuoteModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        product={product}
        variant={variant}
        whatsappNumber={whatsappNumber}
      />
    </div>
  );
}
