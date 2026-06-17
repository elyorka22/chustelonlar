"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function isInternalLink(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const anchor = target.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return false;
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }
  try {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    return href.startsWith("/");
  }
}

export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function start() {
      setVisible(true);
    }

    function onPointerDown(event: PointerEvent) {
      if (isInternalLink(event.target)) start();
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    setVisible(true);
    const done = setTimeout(() => setVisible(false), 450);
    return () => clearTimeout(done);
  }, [pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={pathname}
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 0.92, opacity: 1 }}
          exit={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed left-0 top-0 z-[300] h-[3px] w-full origin-left bg-primary shadow-[0_0_8px_rgba(37,99,235,0.6)]"
        />
      )}
    </AnimatePresence>
  );
}
