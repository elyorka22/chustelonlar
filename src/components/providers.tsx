"use client";

import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { PwaRegister } from "@/components/pwa/pwa-register";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
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
