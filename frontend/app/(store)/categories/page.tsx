import { ClientCategories } from "@/components/store/ClientCategories";

export const dynamic = "force-dynamic";
export const metadata = { title: "Categories" };

export default function CategoriesPage() {
  return <ClientCategories />;
}
