"use client";

import { FormEvent, useEffect, useState } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Banner, ImageAsset } from "@/lib/types";

const blank = {
  title: "",
  subtitle: "",
  buttonText: "",
  buttonLink: "/products",
  sortOrder: 0,
  active: true,
};

export default function AdminBannersPage() {
  const [items, setItems] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(blank);
  const [desktop, setDesktop] = useState<ImageAsset[]>([]);
  const [mobile, setMobile] = useState<ImageAsset[]>([]);

  async function load() {
    const token = getToken();
    if (!token) return;
    setItems(await api.adminBanners(token));
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(banner?: Banner) {
    setEditing(banner || null);
    setForm(
      banner
        ? {
            title: banner.title,
            subtitle: banner.subtitle,
            buttonText: banner.buttonText,
            buttonLink: banner.buttonLink,
            sortOrder: banner.sortOrder,
            active: banner.active,
          }
        : blank,
    );
    setDesktop(banner?.desktopImage ? [banner.desktopImage] : []);
    setMobile(banner?.mobileImage ? [banner.mobileImage] : []);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    const body = {
      ...form,
      desktopImage: desktop[0] || null,
      mobileImage: mobile[0] || null,
    };
    if (editing) await api.updateBanner(token, editing.id, body);
    else await api.createBanner(token, body);
    startEdit();
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete banner?")) return;
    const token = getToken();
    if (!token) return;
    await api.deleteBanner(token, id);
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Banners</h1>
      <form onSubmit={onSubmit} className="admin-card space-y-4">
        <h2 className="font-semibold">{editing ? "Edit banner" : "Add banner"}</h2>
        <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input
          className="input"
          placeholder="Subtitle"
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="input"
            placeholder="Button text"
            value={form.buttonText}
            onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
          />
          <input
            className="input"
            placeholder="Button link"
            value={form.buttonLink}
            onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Desktop banner</p>
          <ImageUploader images={desktop} onChange={setDesktop} multiple={false} />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Mobile banner</p>
          <ImageUploader images={mobile} onChange={setMobile} multiple={false} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          Active
        </label>
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
        {items.map((banner) => (
          <div key={banner.id} className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0">
            <div>
              <p className="font-medium">{banner.title || "Untitled"}</p>
              <p className="text-sm text-muted">{banner.subtitle}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <button type="button" className="text-primary" onClick={() => startEdit(banner)}>
                Edit
              </button>
              <button type="button" className="text-red-600" onClick={() => remove(banner.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
