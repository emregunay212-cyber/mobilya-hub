"use client";
import { useCart } from "@/lib/cart";
import { useState } from "react";

export default function AddToCartButton({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={!product.in_stock}
      className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all ${
        added
          ? "bg-emerald-600 text-white"
          : product.in_stock
          ? "bg-[var(--color-brand)] text-white hover:bg-[var(--color-accent)]"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }`}
    >
      {added ? "✓ Sepete Eklendi!" : product.in_stock ? "🛒 Sepete Ekle" : "Stokta Yok"}
    </button>
  );
}
