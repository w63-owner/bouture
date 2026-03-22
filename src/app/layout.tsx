import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/toast";
import { AppShell } from "@/components/layout/app-shell";
import { ConnectivityProvider } from "@/components/layout/connectivity-provider";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { PwaInstallPrompt } from "@/components/layout/install-prompt";
import { SplashScreen } from "@/components/layout/splash-screen";
import "./globals.css";

export const metadata: Metadata = {
  title: "bouture.app — Échange de boutures",
  description:
    "Découvrez et partagez des boutures de plantes près de chez vous",
  applicationName: "Bouture",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bouture",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#4A6741",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="h-dvh flex flex-col font-body bg-background text-foreground">
        <ConnectivityProvider>
          <SplashScreen />
          <OfflineBanner />
          <AppShell>{children}</AppShell>
          <Toaster />
          <PwaInstallPrompt />
        </ConnectivityProvider>
      </body>
    </html>
  );
}
