"use client";

import StoreWizard from "@/components/admin/StoreWizard";

export default function NewStorePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#E5E7EB" }}>
        Yeni Magaza Olustur
      </h1>
      <StoreWizard />
    </div>
  );
}
