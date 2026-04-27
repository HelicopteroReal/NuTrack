"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { FoodDTO, MealType } from "@/lib/types";
import { AddFoodModal } from "@/components/AddFoodModal";
import { BottomSheetModal } from "@/components/BottomSheetModal";
import { CustomFoodModal } from "@/components/CustomFoodModal";
import { SegmentedControl } from "@/components/SegmentedControl";

type FoodSearchModalProps = {
  open: boolean;
  mealType: MealType;
  onClose: () => void;
  onAdded: () => Promise<void>;
};

export function FoodSearchModal({ open, mealType, onClose, onAdded }: FoodSearchModalProps) {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 250);
  const [reloadKey, setReloadKey] = useState(0);
  const [foods, setFoods] = useState<FoodDTO[]>([]);
  const [source, setSource] = useState<"all" | "default" | "api" | "custom">("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodDTO | null>(null);
  const [customFoodOpen, setCustomFoodOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const search = async () => {
      const searchQuery = debounced || "chicken";
      const q = new URLSearchParams({
        q: searchQuery,
        source,
        page: String(page),
        pageSize: "20",
      }).toString();

      setLoading(true);
      setError("");
      const res = await fetch(`/api/foods/search?${q}`, { cache: "no-store" });
      if (res.ok) {
        const body = await res.json();
        const incoming = body.foods as FoodDTO[];
        setFoods((prev) => (page === 1 ? incoming : [...prev, ...incoming]));
        setHasMore(incoming.length >= 20);
      } else {
        setError("Search failed. Try again.");
      }
      setLoading(false);
    };
    search();
  }, [debounced, open, source, page, reloadKey]);

  useEffect(() => {
    setPage(1);
  }, [debounced, source]);

  const confirmAdd = async (foodId: string, quantity: number) => {
    setSaving(true);
    await fetch("/api/diary/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodId, mealType, quantity }),
    });
    setSaving(false);
    setSelectedFood(null);
    await onAdded();
    onClose();
  };

  const handleDelete = async (food: FoodDTO, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${food.name}"? This cannot be undone.`)) return;
    
    setDeleting(food.id);
    const res = await fetch(`/api/foods/${food.id}`, { method: "DELETE" });
    setDeleting(null);
    
    if (res.ok) {
      setFoods((prev) => prev.filter((f) => f.id !== food.id));
    }
  };

  const handleEdit = (food: FoodDTO, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFood(food);
  };

  if (!open) return null;

  return (
    <>
      <BottomSheetModal open={open} onClose={onClose} title="Search foods">
        <div className="space-y-4">
          <SegmentedControl
            value={source}
            onChange={(value) => setSource(value as typeof source)}
            options={[
              { label: "All foods", value: "all" },
              { label: "My foods", value: "custom" },
              { label: "API foods", value: "api" },
            ]}
          />

          <input
            placeholder="Search oatmeal, chicken, avocado..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-12 w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-3 text-base text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-white/10 dark:bg-gray-900/60 dark:text-gray-100"
          />

          <button
            type="button"
            onClick={() => setCustomFoodOpen(true)}
            className="min-h-12 w-full rounded-2xl border border-white/20 bg-white/70 px-4 py-2 text-sm font-medium text-gray-800 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] dark:border-white/10 dark:bg-gray-900/70 dark:text-gray-100"
          >
            Create custom food
          </button>

          <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
            {foods.map((food) => (
              <div
                key={food.id}
                className="relative flex items-center gap-2 rounded-2xl border border-white/20 bg-white/60 shadow-sm transition-all duration-200 dark:border-white/10 dark:bg-gray-900/60"
              >
                <button
                  onClick={() => setSelectedFood(food)}
                  className="flex-1 p-4 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <p className="font-medium text-gray-900 dark:text-gray-100">{food.name} <span className="text-xs text-gray-500">({food.source || "default"})</span></p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {Math.round(food.calories)} kcal · P {Math.round(food.protein)}g · C {Math.round(food.carbs)}g · F {Math.round(food.fat)}g · {food.servingSize || "100 g"}
                  </p>
                </button>
                {food.source === "custom" && (
                  <div className="flex gap-1 pr-3">
                    <button
                      onClick={(e) => handleEdit(food, e)}
                      className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/30"
                      aria-label="Edit food"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(food, e)}
                      disabled={deleting === food.id}
                      className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-rose-100 hover:text-rose-500 disabled:opacity-50 dark:hover:bg-rose-900/30"
                      aria-label="Delete food"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading foods...</p>}
            {error && <p className="text-sm text-rose-500">{error}</p>}
            {!loading && foods.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No foods found.</p>}
            {hasMore && !loading && (
              <button
                type="button"
                onClick={() => setPage((prev) => prev + 1)}
                className="min-h-11 w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-2 text-sm text-gray-700 dark:border-white/10 dark:bg-gray-900/60 dark:text-gray-200"
              >
                Load more
              </button>
            )}
          </div>
        </div>
      </BottomSheetModal>

      <AddFoodModal
        open={Boolean(selectedFood)}
        food={selectedFood}
        onClose={() => setSelectedFood(null)}
        onConfirm={confirmAdd}
      />

      <CustomFoodModal
        open={customFoodOpen}
        onClose={() => setCustomFoodOpen(false)}
        onCreated={async () => {
          setPage(1);
          setReloadKey((prev) => prev + 1);
          await onAdded();
        }}
      />

      <CustomFoodModal
        open={Boolean(editingFood)}
        onClose={() => setEditingFood(null)}
        editFood={editingFood}
        onCreated={async () => {
          setReloadKey((prev) => prev + 1);
          setEditingFood(null);
        }}
      />

      {saving && (
        <div className="fixed bottom-24 right-4 z-50 rounded-2xl border border-white/20 bg-white/80 px-4 py-2 text-sm text-gray-900 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/80 dark:text-gray-100">
          Saving...
        </div>
      )}
    </>
  );
}
