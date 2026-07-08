import type { Metadata } from "next";
import { Suspense } from "react";
import StoreProvider from "@/app/providers/store-provider";
import AppThemeProvider from "@/app/providers/theme-provider";
import LayoutWrapper from "@/components/navigation/LayoutWrapper";
import LoadingScreen from "@/components/ui/LoadingScreen";
import "./globals.scss";

export const metadata: Metadata = {
  title: "PartyVerse AI - Play Unlimited AI Party Games",
  description: "Dynamic AI-powered multiplayer party game engine including Truth or Dare, Quiz, Charades, and Meme Battles.",
  manifest: "/manifest.json",
  icons: {
    icon: "/app-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <StoreProvider>
          <AppThemeProvider>
            <Suspense fallback={<LoadingScreen />}>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </Suspense>
          </AppThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

