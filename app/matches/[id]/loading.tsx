import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function MatchDetailLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      {/* Back Button Skeleton */}
      <Skeleton className="h-8 w-36" />

      {/* Hero Banner Skeleton */}
      <div className="rounded-xl border border-[#1C2433] bg-[#0F141C] p-6 sm:p-8 min-h-[160px] flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-20 w-44 rounded-xl hidden sm:block" />
      </div>

      {/* Scoreboard Skeleton */}
      <Card>
        <CardHeader className="py-4 px-5 border-b border-[#1C2433] flex items-center justify-between">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3 w-28" />
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-[#1C2433]/50">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
