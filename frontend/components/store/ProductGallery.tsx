"use client";

import Image from "next/image";
import { useState } from "react";
import type { ImageAsset } from "@/lib/types";

export function ProductGallery({ images }: { images: ImageAsset[] }) {
  const list = images?.length ? images : [];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const current = list[active] || list[0];

  if (!current) {
    return <div className="flex aspect-square items-center justify-center bg-white text-muted">No images</div>;
  }

  return (
    <div>
      <div
        className="relative aspect-square cursor-zoom-in overflow-hidden bg-white"
        onClick={() => setZoom(true)}
      >
        <Image
          src={current.url}
          alt={current.alt || "Product image"}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 50vw"
          priority
        />
      </div>
      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2 md:grid-cols-6">
          {list.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden border ${
                i === active ? "border-primary" : "border-transparent"
              }`}
            >
              <Image src={img.url} alt={img.alt || ""} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}

      {zoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoom(false)}
        >
          <div className="relative h-[85vh] w-full max-w-5xl">
            <Image src={current.url} alt={current.alt || ""} fill className="object-contain" sizes="100vw" />
          </div>
        </div>
      )}
    </div>
  );
}
