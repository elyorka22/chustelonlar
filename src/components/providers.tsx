"use client";

import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { NavigationProgress } from "@/components/navigation/navigation-progress";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NavigationProgress />
      <PwaRegister />
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{ className: "rounded-2xl" }}
      />
    </SessionProvider>
  );
}
