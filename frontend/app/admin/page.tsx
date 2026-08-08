"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, formatPrice } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { DashboardData } from "@/lib/types";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api.dashboard(token).then(setData).catch(console.error);
  }, []);

  if (!data) return <p className="text-muted">Loading dashboard…</p>;

  const cards = [
    ["Products", data.totalProducts],
    ["Categories", data.totalCategories],
    ["Brands", data.totalBrands],
    ["Enquiries", data.totalEnquiries],
    ["Pending", data.pendingEnquiries],
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-muted">Overview of your catalog and enquiries.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value]) => (
          <div key={label as string} className="admin-card">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 font-display text-3xl font-semibold">{value as number}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Recent Products" items={data.recentProducts} />
        <Panel title="Low Stock" items={data.lowStockProducts} />
        <Panel title="Most Viewed" items={data.mostViewedProducts} />
      </div>
    </div>
  );
}

function Panel({ title, items }: { title: string; items: DashboardData["recentProducts"] }) {
  return (
    <div className="admin-card">
      <h2 className="font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
            <Link href={`/admin/products/${p.id}`} className="line-clamp-1 font-medium hover:text-primary">
              {p.name}
            </Link>
            <span className="shrink-0 text-muted">{formatPrice(p.sellingPrice)}</span>
          </li>
        ))}
        {items.length === 0 && <li className="text-sm text-muted">None yet</li>}
      </ul>
    </div>
  );
}
