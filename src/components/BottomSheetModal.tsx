"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type BottomSheetModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function BottomSheetModal({ open, title, onClose, children }: BottomSheetModalProps) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/35 transition-all duration-200"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-0 sm:inset-0 sm:items-end sm:p-4">
        <div className="pointer-events-auto h-[92vh] w-full animate-[sheet-up_200ms_ease-out] rounded-t-3xl border border-white/20 bg-white/70 shadow-lg shadow-black/15 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/80 sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-3xl">
          <div className="flex items-center justify-between px-4 pb-2 pt-3">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-300/80 dark:bg-gray-600" />
            <button
              onClick={onClose}
              className="absolute right-4 top-3 rounded-full bg-white/70 p-2 text-gray-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] dark:bg-gray-800/80 dark:text-gray-200"
            >
              <X size={16} />
            </button>
          </div>
          {title && <h2 className="px-5 pb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>}
          <div className="max-h-[80vh] overflow-y-auto px-5 pb-6 sm:max-h-[75vh]">{children}</div>
        </div>
      </div>
    </div>
  );
}
