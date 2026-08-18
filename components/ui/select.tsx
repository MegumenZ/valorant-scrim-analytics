import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-9 w-full rounded-lg border border-[#1C2433] bg-[#090C10] px-3 py-1 text-xs text-[#F1F5F9] placeholder:text-[#64748B] transition-all hover:border-[#2A364F] focus-visible:outline-none focus-visible:border-[#FF4655] focus-visible:ring-1 focus-visible:ring-[#FF4655] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
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
