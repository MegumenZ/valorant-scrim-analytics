import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function MapsLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1C2433] pb-5">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-9 w-32 hidden sm:block" />
      </div>

      {/* Maps Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden space-y-0 flex flex-col justify-between">
            <Skeleton className="h-28 w-full rounded-none" />
            <CardContent className="p-5 space-y-4">
              <Skeleton className="h-3 w-full" />
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <Skeleton className="h-14 rounded-lg" />
                <Skeleton className="h-14 rounded-lg" />
              </div>
              <Skeleton className="h-10 rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
