import type { Metadata } from "next";
import { IBM_Plex_Mono, Sora } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NuTrack",
  description: "Track your daily calories, macros, and nutrition with barcode scanning. Works offline, syncs automatically.",
  manifest: "/manifest.json",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no",
  themeColor: "#10b981",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NuTrack",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nutrack.app",
    title: "NuTrack",
    description: "Track your daily calories, macros, and nutrition with barcode scanning",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "NuTrack Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sora.variable} ${mono.variable} h-full antialiased`}>
      <head>
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NuTrack" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* iOS Safe Area Support */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />

        {/* Camera Permission Hint */}
        <meta name="permissions-policy" content="camera=*, microphone=*, geolocation=*" />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden transition-colors duration-200">
        <ThemeProvider>{children}</ThemeProvider>

        {/* Service Worker Registration - DISABLED due to caching issues with dynamic API calls */}
        {/*
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then(reg => {
                    console.log('✓ Service Worker registered:', reg.scope);
                  }).catch(err => {
                    console.log('✗ Service Worker registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
        */}
      </body>
    </html>
  );
}
