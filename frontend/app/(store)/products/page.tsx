import { ClientProductList } from "@/components/store/ClientProductList";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products" };

export default function ProductsPage() {
  return <ClientProductList />;
}
