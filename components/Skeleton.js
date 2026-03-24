export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-gray-200 rounded w-20" />
          <div className="h-8 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex gap-2 mb-6">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-32" />
      </div>
      <div className="grid md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square bg-gray-200 rounded-2xl" />
        {/* Info */}
        <div className="space-y-4">
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-10 bg-gray-200 rounded w-1/3 mt-4" />
          <div className="h-12 bg-gray-200 rounded w-full mt-6" />
        </div>
      </div>
    </div>
  );
}

export function SearchResultSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-2 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-16" />
    </div>
  );
}
