"use client";

import Image from "next/image";
import { useState } from "react";
import { getToken } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { ImageAsset } from "@/lib/types";

type Props = {
  images: ImageAsset[];
  onChange: (images: ImageAsset[]) => void;
  multiple?: boolean;
};

export function ImageUploader({ images, onChange, multiple = true }: Props) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const token = getToken();
    if (!token) {
      setError("Not authenticated");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const uploaded: ImageAsset[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(await uploadToCloudinary(file, token));
      }
      const next = multiple ? [...images, ...uploaded] : uploaded.slice(0, 1);
      onChange(next.map((img, i) => ({ ...img, sortOrder: i })));
    } catch {
      setError("Upload failed. Add Cloudinary keys, or paste an image URL below.");
    } finally {
      setLoading(false);
    }
  }

  function addUrl() {
    if (!url.trim()) return;
    const asset: ImageAsset = { url: url.trim(), alt: "", sortOrder: images.length };
    onChange(multiple ? [...images, asset] : [asset]);
    setUrl("");
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((img, i) => ({ ...img, sortOrder: i })));
  }

  return (
    <div className="space-y-3">
      <div
        className="rounded-xl border border-dashed border-line bg-bg p-4 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFiles(e.dataTransfer.files);
        }}
      >
        <p className="text-sm text-muted">Drag & drop images, or choose files</p>
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          className="mt-3 block w-full text-sm"
          onChange={(e) => onFiles(e.target.files)}
        />
        {loading && <p className="mt-2 text-sm text-primary">Uploading…</p>}
      </div>
      <div className="flex gap-2">
        <input
          className="input"
          placeholder="Or paste image URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="button" className="btn btn-ghost" onClick={addUrl}>
          Add
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {images.map((img, i) => (
          <div key={`${img.url}-${i}`} className="overflow-hidden rounded-lg border border-line bg-white">
            <div className="relative aspect-square">
              <Image src={img.url} alt={img.alt || ""} fill className="object-cover" sizes="160px" unoptimized />
            </div>
            <div className="flex justify-between gap-1 p-2">
              <button type="button" className="text-xs" onClick={() => move(i, -1)}>
                ←
              </button>
              <button type="button" className="text-xs" onClick={() => move(i, 1)}>
                →
              </button>
              <button
                type="button"
                className="text-xs text-red-600"
                onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
