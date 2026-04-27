"use client";

import { useState, useRef, useCallback } from "react";

export interface BarcodeResult {
  value: string;
  format: string;
}

export function useBarcode() {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<any>(null);

  const requestCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      // Stop the stream
      stream.getTracks().forEach((track) => track.stop());

      setHasPermission(true);
      setError(null);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Camera access denied";
      setError(errorMsg);
      setHasPermission(false);
      return false;
    }
  }, []);

  const startScanning = useCallback(async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        throw new Error("Camera permission denied");
      }

      setIsScanning(true);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to start scanning";
      setError(errorMsg);
      setIsScanning(false);
    }
  }, [requestCameraPermission]);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  }, []);

  const vibrate = useCallback((pattern: number | number[] = 100) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  return {
    isScanning,
    error,
    hasPermission,
    startScanning,
    stopScanning,
    vibrate,
    scannerRef,
    requestCameraPermission,
  };
}
