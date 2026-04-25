"use client";

import { useCallback, useEffect, useState } from "react";
import { DiaryEntryDTO } from "@/lib/types";

type DiaryResponse = {
  entries: DiaryEntryDTO[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  target: number;
};

export function useDiary(date?: string) {
  const [data, setData] = useState<DiaryResponse | null>(null);

  const fetchDiary = useCallback(async () => {
    const query = date ? `?date=${encodeURIComponent(date)}` : "";
    const res = await fetch(`/api/diary/today${query}`, { cache: "no-store" });
    if (res.ok) {
      setData(await res.json());
    }
  }, [date]);

  useEffect(() => {
    fetchDiary();
  }, [fetchDiary]);

  return { data, loading: !data, refresh: fetchDiary };
}
