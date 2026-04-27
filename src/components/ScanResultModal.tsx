"use client";

import { useState } from "react";
import { BottomSheetModal } from "@/components/BottomSheetModal";
import { OpenFoodFactsProduct } from "@/hooks/useFoodAPI";
import { Loader2, AlertCircle } from "lucide-react";

interface ScanResultModalProps {
  open: boolean;
  onClose: () => void;
  product: OpenFoodFactsProduct | null;
  loading: boolean;
  onConfirm: (product: OpenFoodFactsProduct) => void;
}

export function ScanResultModal({ open, onClose, product, loading, onConfirm }: ScanResultModalProps) {
  const [editedProduct, setEditedProduct] = useState<OpenFoodFactsProduct | null>(null);

  const handleConfirm = () => {
    if (editedProduct) {
      onConfirm(editedProduct);
      setEditedProduct(null);
    }
  };

  const handleClose = () => {
    setEditedProduct(null);
    onClose();
  };

  // Use edited product if available, otherwise use original
  const displayProduct = editedProduct || product;

  const updateField = (key: keyof OpenFoodFactsProduct, value: any) => {
    if (editedProduct) {
      setEditedProduct({ ...editedProduct, [key]: value });
    } else if (product) {
      setEditedProduct({ ...product, [key]: value });
    }
  };

  return (
    <BottomSheetModal open={open && (loading || !!product)} onClose={handleClose} title="Product Found">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">Searching for product...</p>
        </div>
      ) : product ? (
        <div className="space-y-4">
          {/* Product Image */}
          {displayProduct?.imageUrl && (
            <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={displayProduct.imageUrl}
                alt={displayProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={displayProduct?.name || ""}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-gray-900/60"
            />
          </div>

          {/* Nutritional Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Calories</label>
              <input
                type="number"
                value={displayProduct?.calories || ""}
                onChange={(e) => updateField("calories", e.target.value ? Number(e.target.value) : 0)}
                className="w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-gray-900/60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Serving</label>
              <input
                type="text"
                value={displayProduct?.servingSize || ""}
                onChange={(e) => updateField("servingSize", e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-gray-900/60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Protein (g)</label>
              <input
                type="number"
                value={displayProduct?.protein || ""}
                onChange={(e) => updateField("protein", e.target.value ? Number(e.target.value) : 0)}
                className="w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-gray-900/60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Carbs (g)</label>
              <input
                type="number"
                value={displayProduct?.carbs || ""}
                onChange={(e) => updateField("carbs", e.target.value ? Number(e.target.value) : 0)}
                className="w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-gray-900/60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fat (g)</label>
              <input
                type="number"
                value={displayProduct?.fat || ""}
                onChange={(e) => updateField("fat", e.target.value ? Number(e.target.value) : 0)}
                className="w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-gray-900/60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fiber (g)</label>
              <input
                type="number"
                value={displayProduct?.fiber || ""}
                onChange={(e) => updateField("fiber", e.target.value ? Number(e.target.value) : undefined)}
                className="w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-gray-900/60"
              />
            </div>
          </div>

          {/* Barcode */}
          <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-2xl">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Barcode: <span className="font-mono font-medium text-gray-900 dark:text-gray-100">{displayProduct?.barcode}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleClose}
              className="flex-1 rounded-2xl border border-white/20 bg-white/70 px-4 py-2 text-gray-800 dark:border-white/10 dark:bg-gray-900/70 dark:text-gray-100 hover:bg-white/80 dark:hover:bg-gray-900/80 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 rounded-2xl bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600 transition-colors font-medium"
            >
              Add to Diary
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <AlertCircle className="w-8 h-8 text-rose-500" />
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
            Product not found. Please try scanning again or search manually.
          </p>
          <button
            onClick={handleClose}
            className="w-full rounded-2xl bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600 transition-colors font-medium text-sm"
          >
            Try Again
          </button>
        </div>
      )}
    </BottomSheetModal>
  );
}
