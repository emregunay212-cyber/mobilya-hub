import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-6">
        <h1 className="text-8xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sayfa Bulunamadi</h2>
        <p className="text-gray-500 mb-6">
          Aradiginiz sayfa tasinmis veya kaldirilmis olabilir.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
        >
          Ana Sayfaya Don
        </Link>
      </div>
    </div>
  );
}
