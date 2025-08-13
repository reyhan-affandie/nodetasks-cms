"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root> & {
  required?: boolean;
  asteriskClassName?: string;
};

function Label({ className, required, asteriskClassName, children, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      data-required={required ? "true" : undefined}
      aria-required={required || undefined}
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className={cn("text-red-600", asteriskClassName)} aria-hidden="true">
          *
        </span>
      )}
    </LabelPrimitive.Root>
  );
}

export { Label };
