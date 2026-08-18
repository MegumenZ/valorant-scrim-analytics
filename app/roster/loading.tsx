import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function RosterLoading() {
  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1C2433] pb-5">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-9 w-36 hidden sm:block" />
      </div>

      {/* Starter Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-10 rounded-lg" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
