import { getStore } from "@/lib/supabase";
import { notFound } from "next/navigation";
import StoreShell from "@/components/StoreShell";

export async function generateMetadata({ params }) {
  const { store: slug } = await params;
  const store = await getStore(slug);
  if (!store) return {};
  return {
    title: `${store.name} | Online Mağaza`,
    description: store.description,
  };
}

export default async function StoreLayout({ children, params }) {
  const { store: slug } = await params;
  const store = await getStore(slug);
  if (!store) notFound();

  return <StoreShell store={store}>{children}</StoreShell>;
}
