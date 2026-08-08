"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/api";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0]?.url || product.variants?.[0]?.images?.[0]?.url || "";
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45 }}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden bg-white">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
              sizes="(max-width:768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">No image</div>
          )}
          {product.isNewArrival && (
            <span className="absolute left-3 top-3 bg-accent px-2 py-1 text-xs font-semibold text-white">
              New
            </span>
          )}
        </div>
        <div className="pt-3">
          <h3 className="line-clamp-2 text-sm font-medium md:text-base">{product.name}</h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-semibold">{formatPrice(product.sellingPrice)}</span>
            {product.mrp > product.sellingPrice && (
              <span className="text-sm text-muted line-through">{formatPrice(product.mrp)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
