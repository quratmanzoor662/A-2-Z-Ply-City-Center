import { ClientCategoryDetail } from "@/components/store/ClientCategories";

export const dynamic = "force-dynamic";

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ClientCategoryDetail slug={slug} />;
}
