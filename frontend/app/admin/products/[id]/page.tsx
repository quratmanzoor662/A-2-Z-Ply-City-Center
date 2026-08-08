"use client";

import { use } from "react";
import { ProductForm } from "@/components/admin/ProductForm";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Edit Product</h1>
      <ProductForm productId={id} />
    </div>
  );
}
