import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "focus-ring flex h-9 w-full rounded-md border border-[var(--border)] bg-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";
