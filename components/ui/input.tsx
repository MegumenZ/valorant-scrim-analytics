import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-lg border border-[#242e40] bg-[#0e131b] px-3 py-1 text-xs text-[#f1f5f9] placeholder:text-[#64748b] transition-all focus-visible:outline-none focus-visible:border-[#FF4655] focus-visible:ring-1 focus-visible:ring-[#FF4655] disabled:cursor-not-allowed disabled:opacity-50 [color-scheme:dark]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
