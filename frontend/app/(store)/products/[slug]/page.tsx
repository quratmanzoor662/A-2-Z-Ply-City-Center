import { ClientProductDetail } from "@/components/store/ClientProductDetail";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ClientProductDetail slug={slug} />;
}
