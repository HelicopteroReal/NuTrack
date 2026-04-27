"use client";

import { useState, useCallback } from "react";

export interface OpenFoodFactsProduct {
  id: string;
  name: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  servingSize?: string;
  imageUrl?: string;
  barcode: string;
  source: "api";
}

export function useFoodAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchByBarcode = useCallback(async (barcode: string): Promise<OpenFoodFactsProduct | null> => {
    setLoading(true);
    setError(null);

    try {
      // Remove non-numeric characters
      const cleanBarcode = barcode.replace(/\D/g, "");

      if (!cleanBarcode || cleanBarcode.length < 8) {
        throw new Error("Invalid barcode format");
      }

      // Try OpenFoodFacts API
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${cleanBarcode}.json`,
        {
          headers: {
            "User-Agent": "NuTrack-App/1.0 (https://nutrack.app)",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Product not found");
      }

      const data = await response.json();

      if (!data.product) {
        throw new Error("Product not found in database");
      }

      const product = data.product;
      const nutrients = product.nutriments || {};

      // Extract nutrition info (per 100g unless specified)
      const servingSize = product.serving_size || "100 g";
      const perServing = product.serving_size ? true : false;

      let multiplier = 1;
      if (!perServing && servingSize && servingSize.includes("100")) {
        multiplier = 1;
      }

      return {
        id: `off-${cleanBarcode}`,
        name: product.product_name || product.generic_name || "Unknown Product",
        calories: Math.round((nutrients["energy-kcal"] || nutrients["energy_value"] || 0) * multiplier),
        protein: Math.round((nutrients.proteins || 0) * multiplier * 10) / 10,
        carbs: Math.round((nutrients.carbohydrates || 0) * multiplier * 10) / 10,
        fat: Math.round((nutrients.fat || 0) * multiplier * 10) / 10,
        fiber: nutrients.fiber ? Math.round(nutrients.fiber * multiplier * 10) / 10 : undefined,
        servingSize: servingSize || "100 g",
        imageUrl: product.image_front_url || undefined,
        barcode: cleanBarcode,
        source: "api",
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to search for product";
      setError(errorMsg);
      console.error("OpenFoodFacts API error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchByName = useCallback(
    async (name: string, limit: number = 5): Promise<OpenFoodFactsProduct[]> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(name)}&page_size=${limit}&json=1`,
          {
            headers: {
              "User-Agent": "NuTrack-App/1.0 (https://nutrack.app)",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();
        const products = data.products || [];

        return products
          .filter((p: any) => p.product_name && (p.nutriments?.["energy-kcal"] || p.nutriments?.energy_value))
          .slice(0, limit)
          .map((product: any) => {
            const nutrients = product.nutriments || {};
            return {
              id: `off-${product.code}`,
              name: product.product_name,
              calories: Math.round(nutrients["energy-kcal"] || nutrients["energy_value"] || 0),
              protein: Math.round((nutrients.proteins || 0) * 10) / 10,
              carbs: Math.round((nutrients.carbohydrates || 0) * 10) / 10,
              fat: Math.round((nutrients.fat || 0) * 10) / 10,
              fiber: nutrients.fiber ? Math.round(nutrients.fiber * 10) / 10 : undefined,
              servingSize: "100 g",
              imageUrl: product.image_front_url || undefined,
              barcode: product.code,
              source: "api" as const,
            };
          });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Search failed";
        setError(errorMsg);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    searchByBarcode,
    searchByName,
    loading,
    error,
  };
}
