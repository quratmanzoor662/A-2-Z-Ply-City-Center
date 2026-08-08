"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, formatPrice } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [q, setQ] = useState("");

  async function load(search = q) {
    const token = getToken();
    if (!token) return;
    const res = await api.adminProducts(token, search || undefined);
    setItems(res.items);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const token = getToken();
    if (!token) return;
    await api.deleteProduct(token, id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Products</h1>
          <p className="mt-2 text-muted">Manage catalog items, variants, and images.</p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary">
          Add product
        </Link>
      </div>
      <div className="flex gap-2">
        <input className="input max-w-sm" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" />
        <button type="button" className="btn btn-ghost" onClick={() => load()}>
          Search
        </button>
      </div>
      <div className="admin-card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="py-2 font-medium">Name</th>
              <th className="py-2 font-medium">SKU</th>
              <th className="py-2 font-medium">Price</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-line/70">
                <td className="py-3 font-medium">{p.name}</td>
                <td className="py-3">{p.sku}</td>
                <td className="py-3">{formatPrice(p.sellingPrice)}</td>
                <td className="py-3 capitalize">{p.status}</td>
                <td className="py-3">
                  <div className="flex gap-3">
                    <Link href={`/admin/products/${p.id}`} className="text-primary">
                      Edit
                    </Link>
                    <button type="button" className="text-red-600" onClick={() => remove(p.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
