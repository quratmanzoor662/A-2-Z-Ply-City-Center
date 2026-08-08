"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Brand, Category, ImageAsset, Product, Spec, Variant } from "@/lib/types";

function newVariant(): Variant {
  return {
    id: crypto.randomUUID(),
    name: "",
    color: "",
    size: "",
    sku: "",
    mrp: 0,
    sellingPrice: 0,
    stock: 0,
    images: [],
  };
}

const empty = {
  name: "",
  sku: "",
  categoryId: "",
  brandId: "",
  shortDescription: "",
  description: "",
  status: "active",
  isFeatured: false,
  isNewArrival: false,
  mrp: 0,
  sellingPrice: 0,
  images: [] as ImageAsset[],
  variants: [] as Variant[],
  specifications: [] as Spec[],
  features: "" as string,
  materials: "" as string,
  finishes: "" as string,
};

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    Promise.all([api.adminCategories(token), api.adminBrands(token)]).then(([cats, brs]) => {
      setCategories(cats);
      setBrands(brs);
    });
    if (productId) {
      api.adminProduct(token, productId).then((p: Product) => {
        setForm({
          name: p.name,
          sku: p.sku,
          categoryId: p.categoryId,
          brandId: p.brandId || "",
          shortDescription: p.shortDescription || "",
          description: p.description || "",
          status: p.status,
          isFeatured: p.isFeatured,
          isNewArrival: p.isNewArrival,
          mrp: p.mrp,
          sellingPrice: p.sellingPrice,
          images: p.images || [],
          variants: p.variants || [],
          specifications: p.specifications || [],
          features: (p.features || []).join("\n"),
          materials: (p.materials || []).join(", "),
          finishes: (p.finishes || []).join(", "),
        });
      });
    }
  }, [productId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setError("");
    const body = {
      name: form.name,
      sku: form.sku,
      categoryId: form.categoryId,
      brandId: form.brandId || null,
      shortDescription: form.shortDescription,
      description: form.description,
      status: form.status,
      isFeatured: form.isFeatured,
      isNewArrival: form.isNewArrival,
      mrp: Number(form.mrp),
      sellingPrice: Number(form.sellingPrice),
      images: form.images,
      variants: form.variants.map((v) => ({
        ...v,
        mrp: Number(v.mrp),
        sellingPrice: Number(v.sellingPrice),
        stock: Number(v.stock),
      })),
      specifications: form.specifications.filter((s) => s.key && s.value),
      features: form.features
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      materials: form.materials
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      finishes: form.finishes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    try {
      if (productId) await api.updateProduct(token, productId, body);
      else await api.createProduct(token, body);
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="admin-card grid gap-4 md:grid-cols-2">
        <Field label="Product name">
          <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="SKU">
          <input className="input" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        </Field>
        <Field label="Category">
          <select className="select" required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">Select</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Brand">
          <select className="select" value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })}>
            <option value="">None</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="MRP">
          <input type="number" className="input" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })} />
        </Field>
        <Field label="Selling price">
          <input
            type="number"
            className="input"
            value={form.sellingPrice}
            onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })}
          />
        </Field>
        <Field label="Status">
          <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </Field>
        <div className="flex items-center gap-6 pt-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isNewArrival}
              onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })}
            />
            New arrival
          </label>
        </div>
        <div className="md:col-span-2">
          <Field label="Short description">
            <input
              className="input"
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Full description">
            <textarea
              className="textarea min-h-28"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
        </div>
      </div>

      <div className="admin-card space-y-3">
        <h2 className="font-semibold">Product images</h2>
        <ImageUploader images={form.images} onChange={(images) => setForm({ ...form, images })} />
      </div>

      <div className="admin-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Variants</h2>
          <button type="button" className="btn btn-ghost" onClick={() => setForm({ ...form, variants: [...form.variants, newVariant()] })}>
            Add variant
          </button>
        </div>
        {form.variants.map((v, index) => (
          <div key={v.id} className="space-y-3 rounded-xl border border-line p-4">
            <div className="grid gap-3 md:grid-cols-3">
              <input className="input" placeholder="Name" value={v.name} onChange={(e) => {
                const variants = [...form.variants];
                variants[index] = { ...v, name: e.target.value };
                setForm({ ...form, variants });
              }} />
              <input className="input" placeholder="Color" value={v.color || ""} onChange={(e) => {
                const variants = [...form.variants];
                variants[index] = { ...v, color: e.target.value };
                setForm({ ...form, variants });
              }} />
              <input className="input" placeholder="Size" value={v.size || ""} onChange={(e) => {
                const variants = [...form.variants];
                variants[index] = { ...v, size: e.target.value };
                setForm({ ...form, variants });
              }} />
              <input className="input" placeholder="SKU" value={v.sku || ""} onChange={(e) => {
                const variants = [...form.variants];
                variants[index] = { ...v, sku: e.target.value };
                setForm({ ...form, variants });
              }} />
              <input type="number" className="input" placeholder="MRP" value={v.mrp} onChange={(e) => {
                const variants = [...form.variants];
                variants[index] = { ...v, mrp: Number(e.target.value) };
                setForm({ ...form, variants });
              }} />
              <input type="number" className="input" placeholder="Price" value={v.sellingPrice} onChange={(e) => {
                const variants = [...form.variants];
                variants[index] = { ...v, sellingPrice: Number(e.target.value) };
                setForm({ ...form, variants });
              }} />
              <input type="number" className="input" placeholder="Stock" value={v.stock} onChange={(e) => {
                const variants = [...form.variants];
                variants[index] = { ...v, stock: Number(e.target.value) };
                setForm({ ...form, variants });
              }} />
            </div>
            <ImageUploader
              images={v.images || []}
              onChange={(images) => {
                const variants = [...form.variants];
                variants[index] = { ...v, images };
                setForm({ ...form, variants });
              }}
            />
            <button
              type="button"
              className="text-sm text-red-600"
              onClick={() => setForm({ ...form, variants: form.variants.filter((_, i) => i !== index) })}
            >
              Remove variant
            </button>
          </div>
        ))}
      </div>

      <div className="admin-card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Specifications</h2>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setForm({ ...form, specifications: [...form.specifications, { key: "", value: "" }] })}
          >
            Add row
          </button>
        </div>
        {form.specifications.map((s, index) => (
          <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input
              className="input"
              placeholder="Key"
              value={s.key}
              onChange={(e) => {
                const specifications = [...form.specifications];
                specifications[index] = { ...s, key: e.target.value };
                setForm({ ...form, specifications });
              }}
            />
            <input
              className="input"
              placeholder="Value"
              value={s.value}
              onChange={(e) => {
                const specifications = [...form.specifications];
                specifications[index] = { ...s, value: e.target.value };
                setForm({ ...form, specifications });
              }}
            />
            <button
              type="button"
              className="text-sm text-red-600"
              onClick={() => setForm({ ...form, specifications: form.specifications.filter((_, i) => i !== index) })}
            >
              Delete
            </button>
          </div>
        ))}
        <Field label="Features (one per line)">
          <textarea className="textarea min-h-24" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
        </Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Materials (comma separated)">
            <input className="input" value={form.materials} onChange={(e) => setForm({ ...form, materials: e.target.value })} />
          </Field>
          <Field label="Finishes (comma separated)">
            <input className="input" value={form.finishes} onChange={(e) => setForm({ ...form, finishes: e.target.value })} />
          </Field>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? "Saving…" : "Save product"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
