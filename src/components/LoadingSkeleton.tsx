"use client";

import clsx from "clsx";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800",
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/60 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/60">
      <Skeleton className="mb-3 h-6 w-1/3" />
      <Skeleton className="mb-2 h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function FoodItemSkeleton() {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/60 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/60">
      <Skeleton className="mb-2 h-5 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function DiaryEntrySkeleton() {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/60 p-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/60">
      <div className="flex-1">
        <Skeleton className="mb-2 h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-8 w-16 rounded-xl" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="h-72 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-emerald-100">
      <Skeleton className="mb-4 h-6 w-1/4" />
      <div className="flex h-[calc(100%-2rem)] items-end gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/20 bg-white/60 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/60">
        <Skeleton className="mb-4 h-7 w-24" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
