"use client";

import { useState } from "react";
import { ProductType, ProductStatus } from "@/app/lib/types/product";

interface FilterState {
  categories: string[];
  tags: string[];
  min_price?: number;
  max_price?: number;
  currency: string;
  product_type?: ProductType;
  status?: ProductStatus;
  sort_by: "relevance" | "created_at" | "price" | "name";
  sort_order: "asc" | "desc";
}

interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const CATEGORIES = [
  "T-Shirts",
  "Jeans",
  "Dresses",
  "Jackets",
  "Shoes",
  "Accessories",
  "Bags",
  "Sweaters",
  "Skirts",
  "Pants",
];

const CURRENCIES = ["USD", "EUR", "GBP", "TRY"];

export default function ProductFilters({
  filters,
  onFilterChange,
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleCategory = (category: string) => {
    const categories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    updateFilter("categories", categories);
  };

  const resetFilters = () => {
    onFilterChange({
      categories: [],
      tags: [],
      currency: "USD",
      status: ProductStatus.ACTIVE,
      sort_by: "relevance",
      sort_order: "desc",
    });
  };

  const activeFilterCount =
    filters.categories.length +
    filters.tags.length +
    (filters.min_price ? 1 : 0) +
    (filters.max_price ? 1 : 0) +
    (filters.product_type ? 1 : 0) +
    (filters.status ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden w-full px-6 py-4 flex items-center justify-between font-semibold text-gray-900"
      >
        <span className="flex items-center gap-2">
          Filters
          {activeFilterCount > 0 && (
            <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Filters Content */}
      <div className={`${isOpen ? "block" : "hidden"} lg:block p-6 space-y-6`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sort_by}
            onChange={(e) => updateFilter("sort_by", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="relevance">Relevance</option>
            <option value="created_at">Date Added</option>
            <option value="price">Price</option>
            <option value="name">Name</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Order
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => updateFilter("sort_order", "desc")}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                filters.sort_order === "desc"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              High to Low
            </button>
            <button
              onClick={() => updateFilter("sort_order", "asc")}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                filters.sort_order === "asc"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Low to High
            </button>
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Categories
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {CATEGORIES.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {category}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Price Range
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <select
                value={filters.currency}
                onChange={(e) => updateFilter("currency", e.target.value)}
                className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Min"
                value={filters.min_price || ""}
                onChange={(e) =>
                  updateFilter(
                    "min_price",
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <input
              type="number"
              placeholder="Max"
              value={filters.max_price || ""}
              onChange={(e) =>
                updateFilter(
                  "max_price",
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Product Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Product Type
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="product_type"
                checked={!filters.product_type}
                onChange={() => updateFilter("product_type", undefined)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">All</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="product_type"
                checked={filters.product_type === ProductType.READY_TO_SELL}
                onChange={() => updateFilter("product_type", ProductType.READY_TO_SELL)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Ready to Sell</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="product_type"
                checked={filters.product_type === ProductType.PRE_ORDER}
                onChange={() => updateFilter("product_type", ProductType.PRE_ORDER)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Pre-Order</span>
            </label>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Status
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={!filters.status}
                onChange={() => updateFilter("status", undefined)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">All</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={filters.status === ProductStatus.ACTIVE}
                onChange={() => updateFilter("status", ProductStatus.ACTIVE)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={filters.status === ProductStatus.INACTIVE}
                onChange={() => updateFilter("status", ProductStatus.INACTIVE)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Inactive</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
