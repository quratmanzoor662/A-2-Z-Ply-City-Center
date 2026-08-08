export type ImageAsset = {
  url: string;
  publicId?: string | null;
  alt?: string;
  sortOrder?: number;
};

export type Spec = { key: string; value: string };

export type Variant = {
  id: string;
  name: string;
  color?: string | null;
  size?: string | null;
  sku?: string | null;
  mrp: number;
  sellingPrice: number;
  stock: number;
  images: ImageAsset[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: ImageAsset | null;
  sortOrder?: number;
  active?: boolean;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: ImageAsset | null;
  active?: boolean;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  desktopImage?: ImageAsset | null;
  mobileImage?: ImageAsset | null;
  sortOrder: number;
  active: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  brandId?: string | null;
  shortDescription?: string;
  description?: string;
  status: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  mrp: number;
  sellingPrice: number;
  discount?: number;
  images: ImageAsset[];
  variants: Variant[];
  specifications: Spec[];
  features?: string[];
  colors?: string[];
  materials?: string[];
  finishes?: string[];
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  viewCount?: number;
  category?: Category | null;
  brand?: Brand | null;
  createdAt?: string;
};

export type ProductListResponse = {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  facets?: {
    colors: string[];
    materials: string[];
    finishes: string[];
  };
};

export type StoreSettings = {
  id?: string;
  storeName: string;
  tagline: string;
  logoUrl: string;
  whatsappNumber: string;
  email: string;
  phone: string;
  address: string;
  mapsUrl: string;
  mapsEmbedUrl: string;
  openingHours: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
};

export type Enquiry = {
  id: string;
  customerName: string;
  phone: string;
  productId: string;
  productName: string;
  variantId?: string | null;
  variantName?: string | null;
  status: "pending" | "contacted" | "completed";
  createdAt: string;
};

export type DashboardData = {
  totalProducts: number;
  totalCategories: number;
  totalBrands: number;
  totalEnquiries: number;
  pendingEnquiries: number;
  recentProducts: Product[];
  lowStockProducts: Product[];
  mostViewedProducts: Product[];
};
