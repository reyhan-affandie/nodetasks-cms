import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton() {
  const dataSkeleton = [];
  for (let i = 0; i < 10; i++) {
    dataSkeleton.push(<Skeleton key={i} className="h-10 w-full bg-blue-200" />);
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-row justify-between">
        <Skeleton className="h-10 w-1/5 bg-blue-400" />
        <Skeleton className="h-10 w-1/12 bg-blue-400" />
      </div>
      {dataSkeleton}
      <div className="flex flex-row justify-between">
        <Skeleton className="h-10 w-2/12 bg-blue-400" />
        <Skeleton className="h-10 w-3/12 bg-blue-400" />
      </div>
    </div>
  );
}
