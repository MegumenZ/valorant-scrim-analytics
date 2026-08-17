import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-9 w-full rounded-lg border border-[#242e40] bg-[#0e131b] px-3 py-1 text-xs text-[#f1f5f9] placeholder:text-[#64748b] transition-all focus-visible:outline-none focus-visible:border-[#FF4655] focus-visible:ring-1 focus-visible:ring-[#FF4655] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
