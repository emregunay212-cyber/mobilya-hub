"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-6">
        <h1 className="text-6xl font-bold text-red-200 mb-4">Hata</h1>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Bir sorun olustu
        </h2>
        <p className="text-gray-500 mb-6">
          Sayfa yuklenirken beklenmeyen bir hata meydana geldi.
        </p>
        <button
          onClick={reset}
          className="inline-block px-6 py-3 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  );
}
