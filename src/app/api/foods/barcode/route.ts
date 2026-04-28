import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/apiAuth";

interface OpenFoodFactsResponse {
  product?: {
    product_name?: string;
    code?: string;
    image_front_url?: string;
    nutriments?: {
      "energy-kcal"?: number;
      "energy_value"?: number;
      proteins?: number;
      carbohydrates?: number;
      fat?: number;
      fiber?: number;
    };
    serving_size?: string;
  };
}

export async function GET(req: NextRequest) {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const barcode = req.nextUrl.searchParams.get("barcode");

  if (!barcode) {
    return NextResponse.json({ error: "Barcode required" }, { status: 400 });
  }

  const cleanBarcode = barcode.replace(/\D/g, "");

  if (!cleanBarcode || cleanBarcode.length < 8) {
    return NextResponse.json({ error: "Invalid barcode format" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${cleanBarcode}.json`,
      {
        headers: {
          "User-Agent": "NuTrack/1.0",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data: OpenFoodFactsResponse = await response.json();

    if (!data.product) {
      return NextResponse.json({ error: "Product not found in database" }, { status: 404 });
    }

    const product = data.product;
    const nutrients = product.nutriments || {};

    const servingSize = product.serving_size || "100 g";

    return NextResponse.json({
      id: `off-${cleanBarcode}`,
      name: product.product_name || "Unknown Product",
      calories: Math.round((nutrients["energy-kcal"] || nutrients["energy_value"] || 0)),
      protein: Math.round((nutrients.proteins || 0) * 10) / 10,
      carbs: Math.round((nutrients.carbohydrates || 0) * 10) / 10,
      fat: Math.round((nutrients.fat || 0) * 10) / 10,
      fiber: nutrients.fiber ? Math.round(nutrients.fiber * 10) / 10 : undefined,
      servingSize: servingSize,
      imageUrl: product.image_front_url || undefined,
      barcode: cleanBarcode,
      source: "api",
    });
  } catch (error) {
    console.error("Barcode lookup error:", error);
    return NextResponse.json(
      { error: "Failed to search for product" },
      { status: 500 }
    );
  }
}
