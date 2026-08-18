"use client";

import NextTopLoader from "nextjs-toploader";

export function TopProgressBar() {
  return (
    <NextTopLoader
      color="#FF4655"
      initialPosition={0.15}
      crawlSpeed={200}
      height={2.5}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={250}
      shadow="0 0 8px #FF4655"
      zIndex={99999}
      showAtBottom={false}
    />
  );
}
