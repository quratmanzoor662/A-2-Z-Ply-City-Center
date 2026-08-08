import { Footer } from "@/components/store/Footer";
import { Header } from "@/components/store/Header";
import { api } from "@/lib/api";
import type { StoreSettings } from "@/lib/types";

const fallbackSettings: StoreSettings = {
  storeName: "A-2-Z Ply City Center",
  tagline: "Premium Plywood & Hardware Solutions",
  logoUrl: "",
  whatsappNumber: "919320630345",
  email: "hello@a2zply.com",
  phone: "+91 93206 30345",
  address: "A-2-Z Ply City Center",
  mapsUrl: "https://maps.app.goo.gl/c5Zgd6MzRepAdHMb6",
  mapsEmbedUrl: "",
  openingHours: "Mon–Sat: 9:00 AM – 8:00 PM",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
};

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  let settings = fallbackSettings;
  try {
    settings = await api.settings();
  } catch {
    /* API may be offline during build */
  }

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-clip">
      <Header storeName={settings.storeName} />
      <main className="w-full">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
