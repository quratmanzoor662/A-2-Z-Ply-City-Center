"use client";

import { FormEvent, useEffect, useState } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Brand, ImageAsset } from "@/lib/types";

export default function AdminBrandsPage() {
  const [items, setItems] = useState<Brand[]>([]);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<ImageAsset[]>([]);

  async function load() {
    const token = getToken();
    if (!token) return;
    setItems(await api.adminBrands(token));
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(brand?: Brand) {
    setEditing(brand || null);
    setName(brand?.name || "");
    setDescription(brand?.description || "");
    setImages(brand?.logo ? [brand.logo] : []);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    const body = { name, description, logo: images[0] || null, active: true };
    if (editing) await api.updateBrand(token, editing.id, body);
    else await api.createBrand(token, body);
    startEdit();
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete brand?")) return;
    const token = getToken();
    if (!token) return;
    await api.deleteBrand(token, id);
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Brands</h1>
      <form onSubmit={onSubmit} className="admin-card space-y-4">
        <h2 className="font-semibold">{editing ? "Edit brand" : "Add brand"}</h2>
        <input className="input" placeholder="Brand name" required value={name} onChange={(e) => setName(e.target.value)} />
        <textarea className="textarea" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <ImageUploader images={images} onChange={setImages} multiple={false} />
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary">
            Save
          </button>
          {editing && (
            <button type="button" className="btn btn-ghost" onClick={() => startEdit()}>
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="admin-card space-y-3">
        {items.map((brand) => (
          <div key={brand.id} className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0">
            <div>
              <p className="font-medium">{brand.name}</p>
              <p className="text-sm text-muted">{brand.description}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <button type="button" className="text-primary" onClick={() => startEdit(brand)}>
                Edit
              </button>
              <button type="button" className="text-red-600" onClick={() => remove(brand.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
