"use client";

import { useState } from "react";
import { api, whatsappLink } from "@/lib/api";
import type { Product, Variant } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  product: Product;
  variant?: Variant | null;
  whatsappNumber: string;
};

/** Accept 10-digit Indian mobiles, optionally with +91 / 91 / 0 prefix. */
function normalizeIndianPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  let mobile = digits;
  if (mobile.startsWith("91") && mobile.length === 12) mobile = mobile.slice(2);
  else if (mobile.startsWith("0") && mobile.length === 11) mobile = mobile.slice(1);
  if (!/^[6-9]\d{9}$/.test(mobile)) return null;
  return mobile;
}

export function QuoteModal({ open, onClose, product, variant, whatsappNumber }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!/^[a-zA-Z\s.'-]{2,60}$/.test(trimmedName)) {
      setError("Name can only contain letters and spaces.");
      return;
    }

    const mobile = normalizeIndianPhone(phone);
    if (!mobile) {
      setError("Enter a valid 10-digit mobile number (e.g. 9320630345).");
      return;
    }

    setLoading(true);
    try {
      await api.createEnquiry({
        customerName: trimmedName,
        phone: mobile,
        productId: product.id,
        productName: product.name,
        variantId: variant?.id,
        variantName: variant?.name,
      });
      const text = [
        `Hi, I'd like a quote for:`,
        `Product: ${product.name}`,
        variant ? `Variant: ${variant.name}` : null,
        `Name: ${trimmedName}`,
        `Phone: ${mobile}`,
      ]
        .filter(Boolean)
        .join("\n");
      window.open(whatsappLink(whatsappNumber, text), "_blank");
      onClose();
      setName("");
      setPhone("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit enquiry");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-semibold">Get a Quote</h3>
            <p className="mt-1 text-sm text-muted">
              {product.name}
              {variant ? ` · ${variant.name}` : ""}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-muted">
            Close
          </button>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Your name</label>
            <input
              className="input"
              required
              minLength={2}
              maxLength={60}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <input
              className="input"
              type="tel"
              inputMode="numeric"
              required
              autoComplete="tel"
              placeholder="10-digit mobile number"
              maxLength={14}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s-]/g, ""))}
            />
            <p className="mt-1 text-xs text-muted">Example: 9320630345</p>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn btn-accent w-full" disabled={loading}>
            {loading ? "Sending…" : "Continue on WhatsApp"}
          </button>
        </form>
      </div>
    </div>
  );
}
