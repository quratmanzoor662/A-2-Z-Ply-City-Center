import { StoreChrome } from "@/components/store/StoreChrome";

export const dynamic = "force-dynamic";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <StoreChrome>{children}</StoreChrome>;
}
