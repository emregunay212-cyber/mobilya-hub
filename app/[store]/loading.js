import { ProductGridSkeleton } from "@/components/Skeleton";

export default function StoreLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero skeleton */}
      <div className="text-center py-12 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-40 mx-auto mb-4" />
        <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-3" />
        <div className="h-4 bg-gray-200 rounded w-48 mx-auto" />
      </div>
      {/* Products skeleton */}
      <ProductGridSkeleton count={8} />
    </div>
  );
}
