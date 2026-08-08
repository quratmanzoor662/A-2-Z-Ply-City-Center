"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { StoreSettings } from "@/lib/types";

const empty: StoreSettings = {
  storeName: "",
  tagline: "",
  logoUrl: "",
  whatsappNumber: "",
  email: "",
  phone: "",
  address: "",
  mapsUrl: "",
  mapsEmbedUrl: "",
  openingHours: "",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<StoreSettings>(empty);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api.adminSettings(token).then(setForm).catch(console.error);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setError("");
    setSaved(false);
    try {
      const res = await api.updateSettings(token, form);
      setForm(res);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  function field(key: keyof StoreSettings, label: string, multiline = false) {
    const value = form[key] || "";
    return (
      <label className="block">
        <span className="mb-1 block text-sm font-medium">{label}</span>
        {multiline ? (
          <textarea
            className="textarea min-h-24"
            value={value}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        ) : (
          <input
            className="input"
            value={value}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        )}
      </label>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Settings</h1>
      <form onSubmit={onSubmit} className="admin-card grid gap-4 md:grid-cols-2">
        {field("storeName", "Store name")}
        {field("tagline", "Tagline")}
        {field("logoUrl", "Logo URL")}
        {field("whatsappNumber", "WhatsApp number")}
        {field("email", "Email")}
        {field("phone", "Phone")}
        <div className="md:col-span-2">{field("address", "Address", true)}</div>
        {field("openingHours", "Opening hours")}
        {field("mapsUrl", "Google Maps URL")}
        <div className="md:col-span-2">{field("mapsEmbedUrl", "Maps embed URL")}</div>
        {field("facebookUrl", "Facebook")}
        {field("instagramUrl", "Instagram")}
        {field("youtubeUrl", "YouTube")}
        <div className="md:col-span-2 flex items-center gap-4">
          <button type="submit" className="btn btn-primary">
            Save settings
          </button>
          {saved && <span className="text-sm text-primary">Saved</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
    </div>
  );
}
