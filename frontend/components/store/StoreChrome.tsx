"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Footer } from "@/components/store/Footer";
import { Header } from "@/components/store/Header";
import { api } from "@/lib/api";
import { fallbackSettings } from "@/lib/fallback";
import type { StoreSettings } from "@/lib/types";

export function StoreChrome({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(fallbackSettings);

  useEffect(() => {
    let cancelled = false;
    api
      .settings()
      .then((data) => {
        if (!cancelled) setSettings(data);
      })
      .catch(() => {
        /* keep fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-clip">
      <Header storeName={settings.storeName} />
      <main className="w-full">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
