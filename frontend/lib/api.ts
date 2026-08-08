import type {
  Banner,
  Brand,
  Category,
  DashboardData,
  Enquiry,
  Product,
  ProductListResponse,
  StoreSettings,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    let detail: string = res.statusText;
    try {
      const data = await res.json();
      if (typeof data.detail === "string") {
        detail = data.detail;
      } else if (Array.isArray(data.detail)) {
        detail = data.detail
          .map((item: { msg?: string }) => item?.msg)
          .filter(Boolean)
          .join(". ") || "Request failed";
      } else if (data.detail) {
        detail = JSON.stringify(data.detail);
      }
    } catch {
      /* ignore */
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string }>("/api/health"),
  settings: () => request<StoreSettings>("/api/settings"),
  banners: () => request<Banner[]>("/api/banners"),
  categories: () => request<Category[]>("/api/categories"),
  category: (slug: string) => request<Category>(`/api/categories/${slug}`),
  brands: () => request<Brand[]>("/api/brands"),
  products: (params: Record<string, string | number | boolean | undefined> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== null) qs.set(k, String(v));
    });
    const q = qs.toString();
    return request<ProductListResponse>(`/api/products${q ? `?${q}` : ""}`);
  },
  product: (slug: string) => request<Product>(`/api/products/${slug}`),
  similar: (slug: string) => request<Product[]>(`/api/products/${slug}/similar`),
  createEnquiry: (body: {
    customerName: string;
    phone: string;
    productId: string;
    productName: string;
    variantId?: string;
    variantName?: string;
  }) =>
    request<Enquiry>("/api/enquiries", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (email: string, password: string) =>
    request<{ accessToken: string }>("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: (token: string) => request<{ id: string; email: string; name: string }>("/api/admin/auth/me", {}, token),
  dashboard: (token: string) => request<DashboardData>("/api/admin/dashboard", {}, token),

  adminCategories: (token: string) => request<Category[]>("/api/admin/categories", {}, token),
  createCategory: (token: string, body: unknown) =>
    request<Category>("/api/admin/categories", { method: "POST", body: JSON.stringify(body) }, token),
  updateCategory: (token: string, id: string, body: unknown) =>
    request<Category>(`/api/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(body) }, token),
  deleteCategory: (token: string, id: string) =>
    request<{ message: string }>(`/api/admin/categories/${id}`, { method: "DELETE" }, token),

  adminBrands: (token: string) => request<Brand[]>("/api/admin/brands", {}, token),
  createBrand: (token: string, body: unknown) =>
    request<Brand>("/api/admin/brands", { method: "POST", body: JSON.stringify(body) }, token),
  updateBrand: (token: string, id: string, body: unknown) =>
    request<Brand>(`/api/admin/brands/${id}`, { method: "PUT", body: JSON.stringify(body) }, token),
  deleteBrand: (token: string, id: string) =>
    request<{ message: string }>(`/api/admin/brands/${id}`, { method: "DELETE" }, token),

  adminBanners: (token: string) => request<Banner[]>("/api/admin/banners", {}, token),
  createBanner: (token: string, body: unknown) =>
    request<Banner>("/api/admin/banners", { method: "POST", body: JSON.stringify(body) }, token),
  updateBanner: (token: string, id: string, body: unknown) =>
    request<Banner>(`/api/admin/banners/${id}`, { method: "PUT", body: JSON.stringify(body) }, token),
  deleteBanner: (token: string, id: string) =>
    request<{ message: string }>(`/api/admin/banners/${id}`, { method: "DELETE" }, token),

  adminProducts: (token: string, q?: string) =>
    request<ProductListResponse>(`/api/admin/products${q ? `?q=${encodeURIComponent(q)}` : ""}`, {}, token),
  adminProduct: (token: string, id: string) => request<Product>(`/api/admin/products/${id}`, {}, token),
  createProduct: (token: string, body: unknown) =>
    request<Product>("/api/admin/products", { method: "POST", body: JSON.stringify(body) }, token),
  updateProduct: (token: string, id: string, body: unknown) =>
    request<Product>(`/api/admin/products/${id}`, { method: "PUT", body: JSON.stringify(body) }, token),
  deleteProduct: (token: string, id: string) =>
    request<{ message: string }>(`/api/admin/products/${id}`, { method: "DELETE" }, token),

  adminEnquiries: (token: string) => request<Enquiry[]>("/api/admin/enquiries", {}, token),
  updateEnquiry: (token: string, id: string, status: string) =>
    request<Enquiry>(`/api/admin/enquiries/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }, token),

  adminSettings: (token: string) => request<StoreSettings>("/api/admin/settings", {}, token),
  updateSettings: (token: string, body: unknown) =>
    request<StoreSettings>("/api/admin/settings", { method: "PUT", body: JSON.stringify(body) }, token),

  uploadSignature: (token: string, folder = "a2z-ply") =>
    request<{
      timestamp: number;
      folder: string;
      signature: string;
      apiKey: string;
      cloudName: string;
    }>(`/api/admin/uploads/signature?folder=${encodeURIComponent(folder)}`, { method: "POST" }, token),
};

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function whatsappLink(number: string, text: string) {
  const n = number.replace(/\D/g, "");
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}
