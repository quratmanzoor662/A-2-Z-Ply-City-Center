"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Enquiry } from "@/lib/types";

export default function AdminEnquiriesPage() {
  const [items, setItems] = useState<Enquiry[]>([]);

  async function load() {
    const token = getToken();
    if (!token) return;
    setItems(await api.adminEnquiries(token));
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    const token = getToken();
    if (!token) return;
    await api.updateEnquiry(token, id, status);
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Enquiries</h1>
      <div className="admin-card overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="py-2 font-medium">Customer</th>
              <th className="py-2 font-medium">Phone</th>
              <th className="py-2 font-medium">Product</th>
              <th className="py-2 font-medium">Variant</th>
              <th className="py-2 font-medium">Date</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-line/70">
                <td className="py-3">{item.customerName}</td>
                <td className="py-3">{item.phone}</td>
                <td className="py-3">{item.productName}</td>
                <td className="py-3">{item.variantName || "—"}</td>
                <td className="py-3">{new Date(item.createdAt).toLocaleString()}</td>
                <td className="py-3">
                  <select
                    className="select"
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="py-6 text-sm text-muted">No enquiries yet.</p>}
      </div>
    </div>
  );
}
