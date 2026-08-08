import { api } from "./api";
import type { ImageAsset } from "./types";

export async function uploadToCloudinary(file: File, token: string, folder = "a2z-ply"): Promise<ImageAsset> {
  const sig = await api.uploadSignature(token, folder);
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    throw new Error("Cloudinary upload failed");
  }
  const data = await res.json();
  return {
    url: data.secure_url as string,
    publicId: data.public_id as string,
    alt: file.name,
    sortOrder: 0,
  };
}
