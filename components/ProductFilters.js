"use client";

import { useState } from "react";

export default function ProductFilters({ products, onFilter }) {
  const [priceRange, setPriceRange] = useState([0, 999999]);
  const [sortBy, setSortBy] = useState("default");
  const [stockOnly, setStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const prices = products.map((p) => p.price);
  const minPrice = Math.min(...prices, 0);
  const maxPrice = Math.max(...prices, 1000);

  function applyFilters(newSort, newPriceRange, newStockOnly) {
    let filtered = [...products];

    // Stock filter
    if (newStockOnly) {
      filtered = filtered.filter((p) => p.in_stock);
    }

    // Price filter
    filtered = filtered.filter(
      (p) => p.price >= newPriceRange[0] && p.price <= newPriceRange[1]
    );

    // Sort
    switch (newSort) {
      case "price_asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name_asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name, "tr"));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
      default:
        break;
    }

    onFilter(filtered);
  }

  function handleSort(value) {
    setSortBy(value);
    applyFilters(value, priceRange, stockOnly);
  }

  function handleStock(checked) {
    setStockOnly(checked);
    applyFilters(sortBy, priceRange, checked);
  }

  function handlePriceMax(value) {
    const range = [priceRange[0], Number(value)];
    setPriceRange(range);
    applyFilters(sortBy, range, stockOnly);
  }

  return (
    <div className="mb-4">
      {/* Mobile toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="sm:hidden flex items-center gap-2 text-sm text-[var(--color-muted)] mb-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
        Filtreler {showFilters ? "▲" : "▼"}
      </button>

      <div className={`${showFilters ? "block" : "hidden"} sm:flex flex-wrap items-center gap-3`}>
        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => handleSort(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm outline-none"
        >
          <option value="default">Siralama</option>
          <option value="price_asc">Fiyat: Dusukten Yuksege</option>
          <option value="price_desc">Fiyat: Yuksekten Dusuge</option>
          <option value="name_asc">A-Z</option>
          <option value="newest">En Yeni</option>
        </select>

        {/* Max price */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-muted)]">Maks:</span>
          <input
            type="number"
            value={priceRange[1] === 999999 ? "" : priceRange[1]}
            onChange={(e) => handlePriceMax(e.target.value || 999999)}
            placeholder={`${maxPrice} TL`}
            className="w-24 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm outline-none"
          />
          <span className="text-xs text-[var(--color-muted)]">TL</span>
        </div>

        {/* Stock only */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={stockOnly}
            onChange={(e) => handleStock(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-[var(--color-muted)]">Sadece stokta</span>
        </label>

        {/* Result count */}
        <span className="text-xs text-[var(--color-muted)] ml-auto">
          {products.length} urun
        </span>
      </div>
    </div>
  );
}
