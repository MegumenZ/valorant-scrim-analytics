import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function MatchesLoading() {
  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1C2433] pb-5">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-36 hidden sm:block" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="p-4 bg-[#0F141C] border border-[#1C2433] rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1">
          <Skeleton className="h-9 w-52" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>

      {/* Matches Table Skeleton */}
      <Card>
        <CardHeader className="py-3.5 px-5 border-b border-[#1C2433] flex flex-row items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-28" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[#1C2433]">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-md" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-14" />
                  <Skeleton className="h-7 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
