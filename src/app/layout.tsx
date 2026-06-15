import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { DesktopHeader, DesktopFooter } from "@/components/layout/desktop-nav";
import { AppShell } from "@/components/mobile/app-shell";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Chust shahri e'lonlari`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: ["chust", "e'lonlar", "classifieds", "uzbekistan"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen bg-white antialiased`}>
        <Providers>
          <div className="hidden md:block">
            <DesktopHeader />
          </div>
          <AppShell>
            <main className="mx-auto min-h-screen max-w-lg md:max-w-7xl">
              {children}
            </main>
          </AppShell>
          <div className="hidden md:block">
            <DesktopFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
