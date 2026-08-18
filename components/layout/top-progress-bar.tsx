"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Complete progress bar when route finishes loading
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept click on links to start progress bar immediately
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      const targetAttr = target.getAttribute("target");

      // Ignore external links, downloads, new tabs, and hash jumps
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("http") ||
        targetAttr === "_blank" ||
        event.ctrlKey ||
        event.metaKey
      ) {
        return;
      }

      // If already on the same path, do nothing
      if (href === pathname || (href === "/" && pathname === "/")) {
        return;
      }

      setLoading(true);
      setProgress(25);

      // Smooth incremental progress
      const p1 = setTimeout(() => setProgress(65), 150);
      const p2 = setTimeout(() => setProgress(85), 450);

      return () => {
        clearTimeout(p1);
        clearTimeout(p2);
      };
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-[2.5px] bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full bg-[#FF4655] shadow-[0_0_8px_#FF4655] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 ? "width 0.15s ease-out, opacity 0.25s ease-in 0.1s" : "width 0.3s ease-out",
        }}
      />
    </div>
  );
}
