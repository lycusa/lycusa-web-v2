"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadMedia, getMediaInfo } from "@/app/lib/api";
import api from "@/app/lib/api";
import type { Product, Media } from "@/app/lib/types/product";
import { ProductType, MediaType } from "@/app/lib/types/product";

interface ProductFormProps {
  product?: Product;
  sellerId: string;
  onSubmit: (data: any) => Promise<void>;
  submitLabel?: string;
}

export default function ProductForm({
  product,
  sellerId,
  onSubmit,
  submitLabel = "Create Product",
}: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price_amount: product?.price.amount || 0,
    price_currency: product?.price.currency || "USD",
    category: product?.category || "",
    tags: product?.tags?.join(", ") || "",
    product_type: product?.product_type || ProductType.READY_TO_SELL,
    due_date: product?.due_date || "",
  });
  const [media, setMedia] = useState<Media[]>(product?.media || []);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<
    {
      fileName: string;
      status: "uploading" | "success" | "rejected" | "failed";
      reason?: string;
    }[]
  >([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    setError(null);
    setUploadProgress(
      Array.from(files).map((file) => ({
        fileName: file.name,
        status: "uploading",
      }))
    );

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const response = await uploadMedia(file);

        if (response.success && response.data) {
          const { status_url } = response.data;

          let attempts = 0;
          const maxAttempts = 30;

          while (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            try {
              const urlPath = status_url.replace(
                "/api/v1/",
                "/product/api/v1/"
              );
              const statusResponse = await api.get(urlPath);
              const { status, result } = statusResponse.data.data;

              if (status === "SUCCESS") {
                if (result?.rejected) {
                  setUploadProgress((prev) =>
                    prev.map((p) =>
                      p.fileName === file.name
                        ? {
                            ...p,
                            status: "rejected",
                            reason:
                              result.reason ||
                              "Media rejected by content moderation.",
                          }
                        : p
                    )
                  );
                } else if (result?.success && result?.media_id) {
                  const mediaInfoResponse = await getMediaInfo(result.media_id);
                  if (mediaInfoResponse.success && mediaInfoResponse.data) {
                    const mediaInfo = mediaInfoResponse.data;
                    const url = new URL(mediaInfo.url);
                    const expires = url.searchParams.get("Expires");

                    if (!expires) {
                      throw new Error("Signed URL missing expiry.");
                    }

                    const newMedia: Media = {
                      id: mediaInfo.id,
                      url: mediaInfo.url,
                      type: mediaInfo.type,
                      order: media.length + i,
                      expires_at: parseInt(expires, 10),
                    };
                    setMedia((prev) => [...prev, newMedia]);
                    setUploadProgress((prev) =>
                      prev.map((p) =>
                        p.fileName === file.name
                          ? { ...p, status: "success" }
                          : p
                      )
                    );
                  }
                }
                break; // Exit polling loop
              } else if (status === "FAILURE") {
                throw new Error(result?.error || "Media upload failed");
              }
            } catch (pollError: any) {
              console.error("Polling error:", pollError);
              if (attempts >= maxAttempts - 1) {
                throw new Error(`Polling failed for ${file.name}: ${pollError.message}`);
              }
            }
            attempts++;
          }
          if (attempts >= maxAttempts) {
            throw new Error(`Upload timed out for ${file.name}`);
          }
        }
      } catch (err: any) {
        console.error(`Upload error for ${file.name}:`, err);
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.fileName === file.name
              ? { ...p, status: "failed", reason: err.message }
              : p
          )
        );
      }
    }
    setUploadingMedia(false);
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const data = {
        seller_id: sellerId,
        name: formData.name,
        description: formData.description,
        price: {
          amount: parseFloat(formData.price_amount.toString()),
          currency: formData.price_currency,
        },
        category: formData.category,
        tags,
        product_type: formData.product_type,
        due_date: formData.due_date || null,
        media: media.map((m, index) => ({ ...m, order: index })),
      };

      await onSubmit(data);
    } catch (err: any) {
      console.error("Submit error:", err);
      setError(err.message || "Failed to save product");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Product Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Product Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Vintage Denim Jacket"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Describe your product in detail..."
        />
      </div>

      {/* Price */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="price_amount"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Price *
          </label>
          <input
            type="number"
            id="price_amount"
            name="price_amount"
            value={formData.price_amount}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>
        <div>
          <label
            htmlFor="price_currency"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Currency *
          </label>
          <select
            id="price_currency"
            name="price_currency"
            value={formData.price_currency}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="TRY">TRY</option>
          </select>
        </div>
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Category *
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a category</option>
          <option value="T-Shirts">T-Shirts</option>
          <option value="Jeans">Jeans</option>
          <option value="Dresses">Dresses</option>
          <option value="Jackets">Jackets</option>
          <option value="Shoes">Shoes</option>
          <option value="Accessories">Accessories</option>
          <option value="Bags">Bags</option>
          <option value="Sweaters">Sweaters</option>
          <option value="Skirts">Skirts</option>
          <option value="Pants">Pants</option>
        </select>
      </div>

      {/* Tags */}
      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Tags (comma-separated)
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="vintage, denim, oversized"
        />
        <p className="mt-1 text-sm text-gray-500">
          Separate tags with commas to help buyers find your product
        </p>
      </div>

      {/* Product Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Product Type *
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="product_type"
              value={ProductType.READY_TO_SELL}
              checked={formData.product_type === ProductType.READY_TO_SELL}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <p className="font-medium text-gray-900">Ready to Sell</p>
              <p className="text-sm text-gray-600">
                Product is available for immediate purchase
              </p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="product_type"
              value={ProductType.PRE_ORDER}
              checked={formData.product_type === ProductType.PRE_ORDER}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <p className="font-medium text-gray-900">Pre-Order</p>
              <p className="text-sm text-gray-600">
                Product will be available on a future date
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Due Date (for pre-orders) */}
      {formData.product_type === ProductType.PRE_ORDER && (
        <div>
          <label
            htmlFor="due_date"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Available Date *
          </label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            value={formData.due_date}
            onChange={handleInputChange}
            required
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Media Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Product Images
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            disabled={uploadingMedia}
            className="hidden"
            id="media-upload"
          />
          <label
            htmlFor="media-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            {uploadingMedia ? (
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            ) : (
              <svg
                className="w-12 h-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
            <p className="text-sm font-medium text-gray-900 mb-1">
              {uploadingMedia ? "Uploading..." : "Click to upload images"}
            </p>
            <p className="text-xs text-gray-500">PNG, JPG up to 50MB each</p>
          </label>
        </div>

        {/* Upload Progress */}
        {uploadProgress.length > 0 && (
          <div className="mt-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">
              Upload Status
            </h4>
            <ul className="space-y-2">
              {uploadProgress.map((p, index) => {
                if (p.status === "rejected") {
                  return (
                    <li key={index}>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-yellow-900">
                            {p.fileName} - Rejected
                          </p>
                          <p className="text-sm text-yellow-700">
                            {p.reason}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                }

                return (
                  <li
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      {p.status === "uploading" && (
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {p.status === "success" && (
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      {p.status === "failed" && (
                        <svg
                          className="w-5 h-5 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                      <span className="text-sm font-medium text-gray-800 truncate max-w-xs">
                        {p.fileName}
                      </span>
                    </div>
                    <div className="text-sm">
                      {p.status === "failed" && (
                        <span className="font-medium text-red-600">
                          Failed:{" "}
                          <span className="font-normal">{p.reason}</span>
                        </span>
                      )}
                      {p.status === "success" && (
                        <span className="font-medium text-green-600">
                          Completed
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Media Preview */}
        {media.length > 0 && (
          <div className="mt-4 grid grid-cols-4 gap-4">
            {media.map((item, index) => (
              <div key={item.id || index} className="relative group">
                <img
                  src={item.url}
                  alt={`Product ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-700"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-900 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || uploadingMedia}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
