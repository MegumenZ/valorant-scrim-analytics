import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4655] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none border",
  {
    variants: {
      variant: {
        default:
          "bg-[#FF4655] text-white border-transparent hover:bg-[#E03E4C] shadow-sm active:scale-[0.98]",
        secondary:
          "bg-[#1c2432] text-[#f1f5f9] border-[#242e40] hover:bg-[#253042] hover:border-[#334155] active:scale-[0.98]",
        outline:
          "border-[#242e40] bg-transparent text-[#94a3b8] hover:bg-[#1c2432] hover:text-[#f1f5f9] hover:border-[#334155]",
        ghost:
          "border-transparent text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1c2432]/70",
        destructive:
          "bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25 active:scale-[0.98]",
        success:
          "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25 active:scale-[0.98]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6 text-sm font-bold",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
