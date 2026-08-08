"use client";

import { FormEvent, useEffect, useState } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Category, ImageAsset } from "@/lib/types";

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<ImageAsset[]>([]);

  async function load() {
    const token = getToken();
    if (!token) return;
    setItems(await api.adminCategories(token));
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(cat?: Category) {
    setEditing(cat || null);
    setName(cat?.name || "");
    setDescription(cat?.description || "");
    setImages(cat?.image ? [cat.image] : []);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    const body = {
      name,
      description,
      image: images[0] || null,
      active: true,
      sortOrder: editing?.sortOrder || 0,
    };
    if (editing) await api.updateCategory(token, editing.id, body);
    else await api.createCategory(token, body);
    startEdit();
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete category?")) return;
    const token = getToken();
    if (!token) return;
    await api.deleteCategory(token, id);
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Categories</h1>
      <form onSubmit={onSubmit} className="admin-card space-y-4">
        <h2 className="font-semibold">{editing ? "Edit category" : "Add category"}</h2>
        <input className="input" placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)} />
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
        {items.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0">
            <div>
              <p className="font-medium">{cat.name}</p>
              <p className="text-sm text-muted">{cat.slug}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <button type="button" className="text-primary" onClick={() => startEdit(cat)}>
                Edit
              </button>
              <button type="button" className="text-red-600" onClick={() => remove(cat.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
