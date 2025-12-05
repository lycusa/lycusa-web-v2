# Elasticsearch Product Search - Frontend Developer Guide

## Table of Contents

1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [Search Parameters](#search-parameters)
4. [Data Models](#data-models)
5. [Implementation Examples](#implementation-examples)
   - [Next.js Examples](#nextjs-examples)
   - [React Native Examples](#react-native-examples)
6. [Advanced Features](#advanced-features)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Product Service provides powerful Elasticsearch-based search capabilities for discovering and filtering products. The search system supports:

- **Full-text search** across product names, descriptions, categories, and tags
- **Advanced filtering** by price range, categories, tags, product type, and status
- **Flexible sorting** by relevance, price, date, or name
- **Pagination** support for large result sets
- **Search suggestions** for autocomplete functionality
- **Seller-based filtering** to find products by specific sellers
- **Real-time relevance scoring** with highlighted search terms

**Base URL**: `http://localhost:3003/api/v1` (or your deployed service URL)

**Note**: Product indexing happens automatically when products are created, updated, or deleted. The Elasticsearch index is managed by the backend service.

---

## API Endpoints

### 1. Search Products (POST)

**Endpoint**: `POST /api/v1/search/products`

**Description**: Search products with advanced filtering and sorting capabilities.

**Authentication**: None required (public endpoint)

**Content-Type**: `application/json`

**Request Body**:
```json
{
  "query": "vintage camera",
  "seller_id": "optional-seller-uuid",
  "categories": ["Electronics", "Photography"],
  "tags": ["vintage", "camera"],
  "min_price": 100.00,
  "max_price": 500.00,
  "currency": "USD",
  "product_type": "ready_to_sell",
  "status": "active",
  "page": 1,
  "size": 20,
  "sort_by": "relevance",
  "sort_order": "desc"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Found 42 products matching your search",
  "data": {
    "query": "vintage camera",
    "total_results": 42,
    "page": 1,
    "size": 20,
    "total_pages": 3,
    "execution_time_ms": 45.23,
    "results": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "seller_id": "987e6543-e89b-12d3-a456-426614174000",
        "name": "Vintage Camera Collection",
        "description": "Beautiful vintage film camera...",
        "price": {
          "amount": "299.99",
          "currency": "USD"
        },
        "category": "Electronics",
        "tags": ["camera", "vintage", "photography"],
        "product_type": "ready_to_sell",
        "status": "active",
        "created_at": "2025-01-15T10:30:00Z",
        "updated_at": "2025-01-15T10:30:00Z",
        "due_date": null,
        "moderation_status": "approved",
        "has_media": true,
        "media_count": 3,
        "media_urls": ["https://...", "https://..."],
        "score": 8.5,
        "highlights": {
          "name": ["<em>Vintage</em> <em>Camera</em> Collection"],
          "description": ["Beautiful <em>vintage</em> film <em>camera</em>..."]
        }
      }
    ],
    "aggregations": {
      "categories": {
        "Electronics": 25,
        "Photography": 17
      },
      "price_ranges": {
        "0-100": 5,
        "100-300": 20,
        "300-500": 17
      }
    }
  }
}
```

### 2. Search Products (GET)

**Endpoint**: `GET /api/v1/search/products`

**Description**: Alternative GET method for simpler searches (useful for URL-based searches and sharing).

**Authentication**: None required (public endpoint)

**Query Parameters**:
- `q` (required): Search query string (min 1 character)
- `seller_id` (optional): Filter by seller ID
- `categories` (optional): Array of category names
- `tags` (optional): Array of tags
- `min_price` (optional): Minimum price (must be >= 0)
- `max_price` (optional): Maximum price (must be >= 0)
- `currency` (optional): Currency code for price filtering
- `product_type` (optional): Product type (`ready_to_sell` or `pre_order`)
- `status` (optional): Product status (`active` or `inactive`)
- `page` (optional): Page number (default: 1, min: 1)
- `size` (optional): Results per page (default: 20, min: 1, max: 100)
- `sort_by` (optional): Sort field (default: `relevance`)
- `sort_order` (optional): Sort order (default: `desc`)

**Example**:
```
GET /api/v1/search/products?q=vintage+camera&categories=Electronics&min_price=100&max_price=500&page=1&size=20&sort_by=price&sort_order=asc
```

### 3. Search Suggestions (POST)

**Endpoint**: `POST /api/v1/search/suggestions`

**Description**: Get autocomplete suggestions for search queries.

**Authentication**: None required (public endpoint)

**Request Body**:
```json
{
  "query": "vint",
  "size": 5
}
```

**Response**:
```json
{
  "success": true,
  "message": "Generated 5 suggestions",
  "data": [
    "vintage camera",
    "vintage electronics",
    "vintage collectibles",
    "vintage watch",
    "vintage guitar"
  ]
}
```

### 4. Search Suggestions (GET)

**Endpoint**: `GET /api/v1/search/suggestions`

**Query Parameters**:
- `q` (required): Partial search query (min 1 character)
- `size` (optional): Number of suggestions (default: 5, min: 1, max: 20)

**Example**:
```
GET /api/v1/search/suggestions?q=vint&size=5
```

### 5. Search Health Check

**Endpoint**: `GET /api/v1/search/health`

**Description**: Check if the search service and Elasticsearch are healthy.

**Response**:
```json
{
  "success": true,
  "message": "Search service health check completed",
  "data": {
    "status": "healthy",
    "service": "search-service",
    "version": "1.0.0",
    "elasticsearch": {
      "status": "connected",
      "index_name": "products",
      "host": "localhost",
      "port": 9200
    }
  }
}
```

---

## Search Parameters

### Query String (`query`)
- **Type**: String (required)
- **Description**: The main search term(s). Searches across product name, description, category, and tags.
- **Examples**:
  - `"camera"` - finds products with "camera" in any searchable field
  - `"vintage camera"` - finds products with both terms (relevance-based)
  - `""` or `"*"` - returns all products (use with filters)

### Seller ID Filter (`seller_id`)
- **Type**: String (UUID, optional)
- **Description**: Filter products by a specific seller.
- **Example**: `"123e4567-e89b-12d3-a456-426614174000"`

### Category Filter (`categories`)
- **Type**: Array of strings (optional)
- **Description**: Filter products that match ANY of the specified categories.
- **Example**: `["Electronics", "Photography", "Vintage"]`

### Tag Filter (`tags`)
- **Type**: Array of strings (optional)
- **Description**: Filter products that have ANY of the specified tags.
- **Example**: `["camera", "vintage", "collectible"]`

### Price Range (`min_price`, `max_price`, `currency`)
- **Type**: Float (optional)
- **Description**: Filter products within a price range. Both must be >= 0.
- **Currency**: Optional currency code (e.g., "USD", "EUR", "TRY")
- **Example**:
  ```json
  {
    "min_price": 100.00,
    "max_price": 500.00,
    "currency": "USD"
  }
  ```

### Product Type (`product_type`)
- **Type**: String enum (optional)
- **Values**:
  - `"ready_to_sell"` - Products available for immediate purchase
  - `"pre_order"` - Products available for pre-order
- **Example**: `"ready_to_sell"`

### Product Status (`status`)
- **Type**: String enum (optional)
- **Values**:
  - `"active"` - Active products (visible to users)
  - `"inactive"` - Inactive products (hidden from users)
- **Default**: Usually you want `"active"` for customer-facing searches
- **Example**: `"active"`

### Pagination (`page`, `size`)
- **Type**: Integer (optional)
- **page**: Page number (default: 1, min: 1)
- **size**: Results per page (default: 20, min: 1, max: 100)
- **Example**:
  ```json
  {
    "page": 2,
    "size": 20
  }
  ```

### Sorting (`sort_by`, `sort_order`)
- **sort_by** (String):
  - `"relevance"` - Sort by search relevance score (default)
  - `"created_at"` - Sort by creation date
  - `"price"` - Sort by price
  - `"name"` - Sort alphabetically by name
- **sort_order** (String):
  - `"desc"` - Descending order (default)
  - `"asc"` - Ascending order
- **Example**:
  ```json
  {
    "sort_by": "price",
    "sort_order": "asc"
  }
  ```

---

## Data Models

### SearchResultItemDTO

```typescript
interface SearchResultItem {
  id: string;                      // UUID
  seller_id: string;               // UUID
  name: string;
  description: string;
  price: {
    amount: string;                // Decimal as string
    currency: string;              // e.g., "USD", "EUR"
  };
  category: string;
  tags: string[];
  product_type: "ready_to_sell" | "pre_order";
  status: "active" | "inactive";
  created_at: string;              // ISO 8601 datetime
  updated_at: string;              // ISO 8601 datetime
  due_date: string | null;         // ISO 8601 datetime or null
  moderation_status: "pending" | "approved" | "rejected";
  has_media: boolean;
  media_count: number;
  media_urls: string[];            // Array of presigned URLs
  score: number;                   // Search relevance score
  highlights: {                    // Highlighted search terms
    [field: string]: string[];     // e.g., {"name": ["<em>Vintage</em> Camera"]}
  };
}
```

### SearchResultDTO

```typescript
interface SearchResult {
  query: string;                   // Original search query
  total_results: number;           // Total matching products
  page: number;                    // Current page number
  size: number;                    // Results per page
  total_pages: number;             // Total number of pages
  execution_time_ms: number;       // Search execution time
  results: SearchResultItem[];     // Array of results
  aggregations: {                  // Search aggregations (facets)
    [key: string]: any;
  };
}
```

### APIResponse

```typescript
interface APIResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}
```

---

## Implementation Examples

### Next.js Examples

#### 1. Basic Search Hook (React Hook)

```typescript
// hooks/useProductSearch.ts
import { useState, useEffect } from 'react';

interface SearchParams {
  query: string;
  categories?: string[];
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  productType?: 'ready_to_sell' | 'pre_order';
  status?: 'active' | 'inactive';
  page?: number;
  size?: number;
  sortBy?: 'relevance' | 'created_at' | 'price' | 'name';
  sortOrder?: 'asc' | 'desc';
}

interface SearchResult {
  id: string;
  name: string;
  description: string;
  price: { amount: string; currency: string };
  category: string;
  tags: string[];
  product_type: string;
  media_urls: string[];
  score: number;
  // ... other fields
}

interface SearchResponse {
  query: string;
  total_results: number;
  page: number;
  size: number;
  total_pages: number;
  execution_time_ms: number;
  results: SearchResult[];
  aggregations: any;
}

export function useProductSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SearchResponse | null>(null);

  const searchProducts = async (params: SearchParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3003/api/v1/search/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: params.query,
          categories: params.categories,
          tags: params.tags,
          min_price: params.minPrice,
          max_price: params.maxPrice,
          currency: params.currency,
          product_type: params.productType,
          status: params.status || 'active', // Default to active products
          page: params.page || 1,
          size: params.size || 20,
          sort_by: params.sortBy || 'relevance',
          sort_order: params.sortOrder || 'desc',
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Search failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return { searchProducts, loading, error, data };
}
```

#### 2. Search Component with Filters

```typescript
// components/ProductSearch.tsx
'use client';

import { useState } from 'react';
import { useProductSearch } from '@/hooks/useProductSearch';

export default function ProductSearch() {
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState<'relevance' | 'price' | 'created_at'>('relevance');
  const [currentPage, setCurrentPage] = useState(1);

  const { searchProducts, loading, error, data } = useProductSearch();

  const handleSearch = async () => {
    await searchProducts({
      query,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      currency: 'USD',
      status: 'active',
      page: currentPage,
      size: 20,
      sortBy,
      sortOrder: sortBy === 'price' ? 'asc' : 'desc',
    });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    searchProducts({
      query,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      page: newPage,
      size: 20,
      sortBy,
    });
  };

  return (
    <div className="container mx-auto p-4">
      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search products..."
          className="w-full px-4 py-2 border rounded-lg"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-lg"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block mb-2 font-semibold">Categories</label>
          <select
            multiple
            value={selectedCategories}
            onChange={(e) =>
              setSelectedCategories(
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="Electronics">Electronics</option>
            <option value="Photography">Photography</option>
            <option value="Vintage">Vintage</option>
            <option value="Fashion">Fashion</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block mb-2 font-semibold">Price Range</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange({ ...priceRange, min: Number(e.target.value) })
              }
              placeholder="Min"
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange({ ...priceRange, max: Number(e.target.value) })
              }
              placeholder="Max"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block mb-2 font-semibold">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="relevance">Relevance</option>
            <option value="price">Price</option>
            <option value="created_at">Newest</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Results */}
      {data && (
        <div>
          <div className="mb-4">
            <p className="text-gray-600">
              Found {data.total_results} products in {data.execution_time_ms.toFixed(2)}ms
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.results.map((product) => (
              <div key={product.id} className="border rounded-lg p-4">
                {product.media_urls.length > 0 && (
                  <img
                    src={product.media_urls[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-2"
                  />
                )}
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {product.description}
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {product.price.currency} {product.price.amount}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Score: {product.score.toFixed(2)}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-200 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.total_pages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {currentPage} of {data.total_pages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === data.total_pages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

#### 3. Search Autocomplete Component

```typescript
// components/SearchAutocomplete.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash'; // or implement your own debounce

export default function SearchAutocomplete() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3003/api/v1/search/suggestions?q=${encodeURIComponent(
            searchQuery
          )}&size=5`
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setSuggestions(result.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchSuggestions(query);
  }, [query, fetchSuggestions]);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    // Trigger search with the selected suggestion
    // ... implement your search logic
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder="Search products..."
        className="w-full px-4 py-2 border rounded-lg"
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}
```

#### 4. Server-Side Search (Next.js App Router)

```typescript
// app/search/page.tsx
import { Suspense } from 'react';

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
    page?: string;
  };
}

async function searchProducts(params: any) {
  const response = await fetch('http://localhost:3003/api/v1/search/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: params.q || '',
      categories: params.category ? [params.category] : undefined,
      status: 'active',
      page: parseInt(params.page || '1'),
      size: 20,
    }),
    cache: 'no-store', // or configure as needed
  });

  if (!response.ok) {
    throw new Error('Search failed');
  }

  const result = await response.json();
  return result.data;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const data = await searchProducts(searchParams);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Search Results</h1>

      <p className="mb-4">
        Found {data.total_results} products for "{data.query}"
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.results.map((product: any) => (
          <div key={product.id} className="border rounded-lg p-4">
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-gray-600">{product.description}</p>
            <p className="text-xl font-bold mt-2">
              {product.price.currency} {product.price.amount}
            </p>
          </div>
        ))}
      </div>

      {/* Add pagination links */}
    </div>
  );
}
```

---

### React Native Examples

#### 1. Search Hook (React Native)

```typescript
// hooks/useProductSearch.ts
import { useState } from 'react';

interface SearchParams {
  query: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sortBy?: string;
}

export function useProductSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const searchProducts = async (params: SearchParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3003/api/v1/search/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: params.query,
          categories: params.categories,
          min_price: params.minPrice,
          max_price: params.maxPrice,
          status: 'active',
          page: params.page || 1,
          size: params.size || 20,
          sort_by: params.sortBy || 'relevance',
          sort_order: 'desc',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Search failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return { searchProducts, loading, error, data };
}
```

#### 2. Search Screen Component

```typescript
// screens/SearchScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useProductSearch } from '../hooks/useProductSearch';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { searchProducts, loading, error, data } = useProductSearch();

  const handleSearch = () => {
    if (query.trim()) {
      setCurrentPage(1);
      searchProducts({ query, page: 1 });
    }
  };

  const handleLoadMore = () => {
    if (data && currentPage < data.total_pages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      searchProducts({ query, page: nextPage });
    }
  };

  const renderProduct = ({ item }: any) => (
    <TouchableOpacity style={styles.productCard}>
      {item.media_urls.length > 0 && (
        <Image
          source={{ uri: item.media_urls[0] }}
          style={styles.productImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.productPrice}>
          {item.price.currency} {item.price.amount}
        </Text>
        <View style={styles.tagsContainer}>
          {item.tags.map((tag: string, index: number) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          placeholder="Search products..."
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? 'Searching...' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Results */}
      {data && (
        <>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              Found {data.total_results} products
            </Text>
            <Text style={styles.executionTime}>
              ({data.execution_time_ms.toFixed(2)}ms)
            </Text>
          </View>

          <FlatList
            data={data.results}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loading ? (
                <ActivityIndicator size="large" style={styles.loader} />
              ) : null
            }
          />
        </>
      )}

      {loading && !data && (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  resultsHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 16,
    color: '#666',
  },
  executionTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 200,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  loader: {
    marginVertical: 20,
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

#### 3. Search with Filters (React Native)

```typescript
// components/SearchFilters.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';

interface FilterProps {
  onApplyFilters: (filters: any) => void;
}

export default function SearchFilters({ onApplyFilters }: FilterProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState('relevance');

  const categories = ['Electronics', 'Photography', 'Vintage', 'Fashion'];
  const sortOptions = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Newest', value: 'created_at' },
  ];

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleApply = () => {
    onApplyFilters({
      categories: selectedCategories,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      sortBy,
    });
    setModalVisible(false);
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 1000 });
    setSortBy('relevance');
  };

  return (
    <>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.filterButtonText}>Filters</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filters</Text>

            <ScrollView>
              {/* Categories */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Categories</Text>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={styles.checkboxContainer}
                    onPress={() => toggleCategory(category)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedCategories.includes(category) &&
                          styles.checkboxChecked,
                      ]}
                    />
                    <Text style={styles.checkboxLabel}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sort By */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sort By</Text>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.radioContainer}
                    onPress={() => setSortBy(option.value)}
                  >
                    <View
                      style={[
                        styles.radio,
                        sortBy === option.value && styles.radioChecked,
                      ]}
                    />
                    <Text style={styles.radioLabel}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  filterButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  filterButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 4,
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkboxLabel: {
    fontSize: 16,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radio: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    marginRight: 12,
  },
  radioChecked: {
    backgroundColor: '#007AFF',
  },
  radioLabel: {
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginRight: 8,
  },
  resetButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  applyButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginRight: 8,
  },
  applyButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  closeButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  closeButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
});
```

---

## Advanced Features

### 1. Search Highlights

The search results include `highlights` field that shows where search terms matched in the content:

```typescript
interface Highlight {
  name?: string[];
  description?: string[];
  category?: string[];
  tags?: string[];
}

// Example usage
function renderHighlightedText(highlights: string[]) {
  return highlights.map((highlight, index) => {
    // Parse HTML-like <em> tags and render with custom styling
    const parts = highlight.split(/<em>|<\/em>/);
    return (
      <span key={index}>
        {parts.map((part, i) =>
          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        )}
      </span>
    );
  });
}
```

### 2. Aggregations (Facets)

The search response includes aggregations that show result distribution:

```typescript
// Example aggregations
{
  "aggregations": {
    "categories": {
      "Electronics": 25,
      "Photography": 17,
      "Fashion": 10
    },
    "price_ranges": {
      "0-100": 5,
      "100-300": 20,
      "300-500": 17,
      "500+": 10
    },
    "product_types": {
      "ready_to_sell": 45,
      "pre_order": 7
    }
  }
}

// Use aggregations to build filter UI
function CategoryFacets({ aggregations, onFilter }: any) {
  return (
    <div>
      <h3>Filter by Category</h3>
      {Object.entries(aggregations.categories || {}).map(([category, count]) => (
        <button key={category} onClick={() => onFilter(category)}>
          {category} ({count})
        </button>
      ))}
    </div>
  );
}
```

### 3. Relevance Score

Each search result includes a `score` field indicating how well it matches the query:

- Higher scores indicate better matches
- Scores are relative to the query and result set
- Useful for debugging relevance issues
- Can be used to filter out low-quality results

```typescript
// Filter results by minimum score
const highQualityResults = data.results.filter(
  (product) => product.score >= 5.0
);
```

### 4. Empty Query Search

To get all products (with optional filters), use an empty query:

```typescript
await searchProducts({
  query: '', // Empty query returns all products
  status: 'active',
  categories: ['Electronics'],
  sortBy: 'created_at',
});
```

---

## Best Practices

### 1. Performance Optimization

**Debounce Search Input**
```typescript
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

const debouncedSearch = useMemo(
  () => debounce((query) => searchProducts({ query }), 300),
  []
);
```

**Use Pagination**
```typescript
// Don't request all results at once
// Use reasonable page sizes (10-50 items)
searchProducts({
  query: 'camera',
  page: 1,
  size: 20, // Good default
});
```

**Cache Results**
```typescript
// Cache search results to avoid repeated API calls
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['products', query, filters],
  queryFn: () => searchProducts({ query, ...filters }),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### 2. User Experience

**Show Loading States**
```typescript
{loading && <LoadingSpinner />}
{!loading && data && <Results data={data} />}
```

**Handle Empty Results**
```typescript
{data && data.total_results === 0 && (
  <EmptyState message="No products found. Try different search terms." />
)}
```

**Progressive Enhancement**
```typescript
// Load initial results, then allow filtering
useEffect(() => {
  searchProducts({ query: '*', status: 'active' });
}, []);
```

**Preserve Search State**
```typescript
// Use URL params to preserve search state
const router = useRouter();

const handleSearch = (params) => {
  const queryString = new URLSearchParams(params).toString();
  router.push(`/search?${queryString}`);
};
```

### 3. Error Handling

**Graceful Degradation**
```typescript
try {
  await searchProducts(params);
} catch (error) {
  // Show error message but don't break the UI
  setError('Search temporarily unavailable. Please try again.');
  // Optional: fallback to cached results
}
```

**Retry Logic**
```typescript
async function searchWithRetry(params: any, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await searchProducts(params);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 4. Search Query Optimization

**Trim and Validate Input**
```typescript
const sanitizedQuery = query.trim();
if (sanitizedQuery.length < 2) {
  setError('Please enter at least 2 characters');
  return;
}
```

**Default to Active Products**
```typescript
// Always filter to active products for customer-facing searches
searchProducts({
  query,
  status: 'active', // Don't show inactive products
});
```

**Combine Filters Intelligently**
```typescript
// Build filter object dynamically
const filters: any = {
  query,
  status: 'active',
};

if (selectedCategories.length > 0) {
  filters.categories = selectedCategories;
}

if (minPrice > 0 || maxPrice < 10000) {
  filters.min_price = minPrice;
  filters.max_price = maxPrice;
  filters.currency = 'USD';
}
```

### 5. Mobile Optimization

**Use GET Method for Simple Searches**
```typescript
// GET requests can be cached by browsers/CDNs
const url = `/api/v1/search/products?q=${encodeURIComponent(query)}&page=${page}`;
fetch(url);
```

**Implement Infinite Scroll**
```typescript
// React Native FlatList example
<FlatList
  data={results}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

**Optimize Images**
```typescript
// Use appropriate image sizes from media_urls
<Image
  source={{ uri: product.media_urls[0] }}
  resizeMode="cover"
  style={{ width: 300, height: 300 }}
/>
```

### 6. Security Considerations

**Sanitize User Input**
```typescript
// Prevent XSS in search queries
import DOMPurify from 'dompurify';

const sanitizedQuery = DOMPurify.sanitize(userInput);
```

**Rate Limiting Awareness**
```typescript
// The API has rate limiting enabled
// Implement client-side throttling to avoid hitting limits
const throttledSearch = throttle(searchProducts, 1000);
```

---

## Troubleshooting

### Common Issues

#### 1. No Results Found

**Problem**: Search returns 0 results

**Solutions**:
- Check that products exist in the database and are indexed
- Verify the `status` filter (use `"active"` for published products)
- Try a broader search query or remove filters
- Check spelling in search query
- Verify Elasticsearch is running: `GET /api/v1/search/health`

#### 2. Slow Search Performance

**Problem**: Search takes too long

**Solutions**:
- Reduce `size` parameter (use smaller page sizes)
- Remove unnecessary filters
- Check Elasticsearch health and performance
- Implement caching on the frontend
- Use debouncing for search-as-you-type

#### 3. Unexpected Results

**Problem**: Results don't match expectations

**Solutions**:
- Check `highlights` field to see what matched
- Review `score` values to understand relevance
- Verify filter parameters are correct
- Ensure correct `sort_by` and `sort_order`
- Check `aggregations` to understand result distribution

#### 4. Empty Suggestions

**Problem**: Autocomplete returns no suggestions

**Solutions**:
- Ensure query is at least 2 characters
- Verify products exist with similar names/terms
- Check Elasticsearch health
- Wait for products to be indexed (indexing is async)

#### 5. Invalid Price Range

**Problem**: Error when filtering by price

**Solutions**:
- Ensure `max_price` > `min_price`
- Both values must be >= 0
- Include `currency` parameter when using price filters
- Verify decimal formatting (use number, not string)

### Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "max_price must be greater than min_price"
  ]
}
```

**Solution**: Check request parameters against validation rules

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Search operation failed: connection error"
}
```

**Solution**: Check Elasticsearch connectivity and service health

#### 503 Service Unavailable
```json
{
  "success": false,
  "message": "Search service configuration error"
}
```

**Solution**: Elasticsearch may be down. Check `/api/v1/search/health`

### Debugging Tips

**1. Check Search Health**
```typescript
const healthResponse = await fetch('http://localhost:3003/api/v1/search/health');
const health = await healthResponse.json();
console.log('Search health:', health);
```

**2. Log Execution Time**
```typescript
console.log(`Search completed in ${data.execution_time_ms}ms`);
```

**3. Inspect Relevance Scores**
```typescript
data.results.forEach(product => {
  console.log(`${product.name}: score ${product.score}`);
});
```

**4. Review Highlights**
```typescript
data.results.forEach(product => {
  console.log(`Highlights for ${product.name}:`, product.highlights);
});
```

**5. Test with cURL**
```bash
curl -X POST http://localhost:3003/api/v1/search/products \
  -H "Content-Type: application/json" \
  -d '{
    "query": "camera",
    "status": "active",
    "page": 1,
    "size": 5
  }'
```

---

## Additional Resources

- **API Documentation**: See `docs/API_DOCUMENTATION.md` for complete API reference
- **Authentication Guide**: See `docs/AUTHENTICATION_GUIDE.md` for auth setup
- **Elasticsearch Documentation**: https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html
- **Product Service Health**: `GET /api/v1/health`
- **Search Service Health**: `GET /api/v1/search/health`

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API documentation
3. Check service health endpoints
4. Contact the backend team with:
   - Request/response details
   - Error messages
   - Search parameters used
   - Expected vs actual results
