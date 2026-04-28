"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { GlassCard } from "@/components/GlassCard";

interface MacroRatioChartProps {
  protein: number;
  carbs: number;
  fat: number;
  target?: {
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

/**
 * Enhanced macro ratio visualization
 * Shows protein/carbs/fat distribution as interactive pie chart
 */
export function MacroRatioChart({ protein, carbs, fat, target }: MacroRatioChartProps) {
  // Colors for macros
  const COLORS = {
    protein: "#3b82f6", // Blue
    carbs: "#f97316", // Orange
    fat: "#ef4444", // Red
    light: {
      protein: "#bfdbfe",
      carbs: "#fed7aa",
      fat: "#fecaca",
    },
    dark: {
      protein: "#1e40af",
      carbs: "#c2410c",
      fat: "#7f1d1d",
    },
  };

  // Calculate data for pie chart
  const data = useMemo(() => {
    const total = protein + carbs + fat || 1; // Avoid division by zero
    return [
      {
        name: "Protein",
        value: Math.round((protein / total) * 100),
        actual: protein,
        color: COLORS.protein,
      },
      {
        name: "Carbs",
        value: Math.round((carbs / total) * 100),
        actual: carbs,
        color: COLORS.carbs,
      },
      {
        name: "Fat",
        value: Math.round((fat / total) * 100),
        actual: fat,
        color: COLORS.fat,
      },
    ];
  }, [protein, carbs, fat]);

  // Custom label for pie chart
  const renderLabel = (entry: any) => {
    return `${entry.value}%`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-white/20 bg-gray-900/90 px-3 py-2 backdrop-blur-xl">
          <p className="font-medium text-white">{data.name}</p>
          <p className="text-sm text-gray-300">{data.value}% ({data.actual}g)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <GlassCard className="p-5">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Macronutrient Distribution
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Today's intake: {Math.round(protein + carbs + fat)}g total
          </p>
        </div>

        {/* Chart */}
        {protein + carbs + fat > 0 ? (
          <div className="-mx-2 -my-2">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={600}
                  animationEasing="ease-out"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-60 items-center justify-center rounded-xl bg-white/10 dark:bg-gray-800/20">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No macros logged yet today
            </p>
          </div>
        )}

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          {/* Protein */}
          <div className="rounded-lg bg-blue-500/10 p-3 dark:bg-blue-950/30">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Protein
              </span>
            </div>
            <p className="mt-2 text-lg font-bold text-blue-600 dark:text-blue-400">
              {Math.round(protein)}g
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {protein + carbs + fat > 0
                ? Math.round((protein / (protein + carbs + fat)) * 100)
                : 0}
              %
            </p>
          </div>

          {/* Carbs */}
          <div className="rounded-lg bg-orange-500/10 p-3 dark:bg-orange-950/30">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-500"></div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Carbs
              </span>
            </div>
            <p className="mt-2 text-lg font-bold text-orange-600 dark:text-orange-400">
              {Math.round(carbs)}g
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {protein + carbs + fat > 0
                ? Math.round((carbs / (protein + carbs + fat)) * 100)
                : 0}
              %
            </p>
          </div>

          {/* Fat */}
          <div className="rounded-lg bg-red-500/10 p-3 dark:bg-red-950/30">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Fat
              </span>
            </div>
            <p className="mt-2 text-lg font-bold text-red-600 dark:text-red-400">
              {Math.round(fat)}g
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {protein + carbs + fat > 0
                ? Math.round((fat / (protein + carbs + fat)) * 100)
                : 0}
              %
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-lg bg-white/10 p-3 dark:bg-gray-800/20">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            💡 <span className="font-medium">Tip:</span> A balanced diet typically aims for:
            Protein 25-35%, Carbs 45-65%, Fat 20-35%
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
