import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  const dataSkeleton = [];
  for (let i = 0; i < 10; i++) {
    dataSkeleton.push(<Skeleton key={i} className="h-10 w-full bg-blue-200" />);
  }
  return (
    <div className="space-y-3">
      {dataSkeleton}
    </div>
  );
}
