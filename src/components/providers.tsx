"use client";

import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
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
