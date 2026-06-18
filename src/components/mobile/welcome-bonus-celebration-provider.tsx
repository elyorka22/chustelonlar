"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { claimWelcomeCelebration } from "@/lib/actions";
import { isActionError } from "@/lib/action-result";
import {
  WELCOME_BONUS_CHECK_EVENT,
  type WelcomeBonusCelebration,
} from "@/lib/welcome-bonus-celebration";
import { WelcomeBonusCelebrationModal } from "@/components/mobile/welcome-bonus-celebration-modal";

type WelcomeBonusContextValue = {
  checkCelebration: () => Promise<void>;
};

const WelcomeBonusContext = createContext<WelcomeBonusContextValue | null>(null);

export function useWelcomeBonusCelebration() {
  const ctx = useContext(WelcomeBonusContext);
  if (!ctx) {
    return { checkCelebration: async () => {} };
  }
  return ctx;
}

export function WelcomeBonusCelebrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [celebration, setCelebration] = useState<WelcomeBonusCelebration | null>(null);
  const checkingRef = useRef(false);

  const checkCelebration = useCallback(async () => {
    if (status !== "authenticated" || checkingRef.current) return;

    checkingRef.current = true;
    try {
      const result = await claimWelcomeCelebration();
      if (isActionError(result) || !result.celebration) return;

      setCelebration(result.celebration);
      setOpen(true);
    } catch (error) {
      console.error("Welcome celebration check failed:", error);
    } finally {
      checkingRef.current = false;
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      void checkCelebration();
    }
  }, [status, checkCelebration]);

  useEffect(() => {
    const onCheck = () => {
      void checkCelebration();
    };

    window.addEventListener(WELCOME_BONUS_CHECK_EVENT, onCheck);
    return () => window.removeEventListener(WELCOME_BONUS_CHECK_EVENT, onCheck);
  }, [checkCelebration]);

  const handleClose = () => {
    setOpen(false);
    setCelebration(null);
    window.setTimeout(() => {
      void checkCelebration();
    }, 400);
  };

  return (
    <WelcomeBonusContext.Provider value={{ checkCelebration }}>
      {children}
      <WelcomeBonusCelebrationModal
        open={open}
        celebration={celebration}
        onClose={handleClose}
      />
    </WelcomeBonusContext.Provider>
  );
}
