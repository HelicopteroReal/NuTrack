"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useBarcode } from "@/hooks/useBarcode";
import { X, Loader2 } from "lucide-react";

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ open, onClose, onScan }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const { vibrate } = useBarcode();

  useEffect(() => {
    if (!open || isInitialized) return;

    const initScanner = async () => {
      try {
        if (!containerRef.current) return;

        // Create scanner instance
        const html5QrCode = new Html5Qrcode("scanner-container");

        scannerRef.current = html5QrCode;

        // Start camera
        await html5QrCode.start(
          { facingMode: "environment" }, // Use back camera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // Barcode detected
            console.log("Barcode detected:", decodedText);
            vibrate([50, 100, 50]); // Haptic feedback

            setScannedValue(decodedText);
            onScan(decodedText);

            // Auto-close after successful scan
            setTimeout(() => {
              handleClose();
            }, 500);
          },
          (error) => {
            // This is called frequently, ignore noisy logs
            if (!error.includes("NotFoundException")) {
              console.debug("Scanner error:", error);
            }
          }
        );

        setIsInitialized(true);
        setError(null);
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Failed to initialize barcode scanner. Make sure you have camera permissions.";

        setError(errorMsg);
        console.error("Scanner initialization error:", err);
      }
    };

    initScanner();

    return () => {
      // Cleanup
      if (scannerRef.current) {
        scannerRef.current.stop().catch((err) => {
          console.error("Error stopping scanner:", err);
        });
      }
    };
  }, [open, isInitialized, onScan, vibrate]);

  const handleClose = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsInitialized(false);
        setScannedValue(null);
        setError(null);
      } catch (err) {
        console.error("Error closing scanner:", err);
      }
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between bg-black/80 px-4 py-3 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white">Scan Barcode</h2>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Close scanner"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Scanner Container */}
      <div className="flex-1 flex items-center justify-center bg-black overflow-hidden">
        <div ref={containerRef} className="w-full h-full">
          <div id="scanner-container" className="w-full h-full" />
        </div>

        {/* Scanning frame overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-4 border-emerald-500 rounded-2xl shadow-[0_0_0_2000px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 rounded-2xl border-2 border-emerald-500/30 animate-pulse" />
          </div>
        </div>

        {/* Loading indicator */}
        {!isInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-white text-sm">Initializing camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-500/20 border-t border-rose-500/50 px-4 py-3 backdrop-blur-sm">
          <p className="text-rose-100 text-sm">{error}</p>
          <button
            onClick={handleClose}
            className="mt-2 w-full px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm font-medium"
          >
            Close & Retry
          </button>
        </div>
      )}

      {/* Info */}
      <div className="bg-black/80 border-t border-white/10 px-4 py-3 backdrop-blur-sm">
        <p className="text-white/70 text-xs text-center">
          Position barcode within frame. Phone will vibrate when code is detected.
        </p>
      </div>
    </div>
  );
}
