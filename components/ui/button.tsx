import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-display uppercase tracking-wider text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF4655] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none border rounded-[4px]",
  {
    variants: {
      variant: {
        default:
          "bg-[#FF4655] text-white border-transparent hover:bg-[#FF2B3D] shadow-md shadow-[#FF4655]/20 hover:shadow-[#FF4655]/40 active:scale-[0.98]",
        secondary:
          "bg-[#121824] text-[#ece8e1] border-[#1f2c42] hover:bg-[#1a2333] hover:border-[#2e4162] hover:text-white active:scale-[0.98]",
        outline:
          "border-[#1f2c42] bg-transparent text-[#8b9bb4] hover:bg-[#121824] hover:text-[#ece8e1] hover:border-[#2e4162]",
        ghost:
          "border-transparent text-[#8b9bb4] hover:text-[#ece8e1] hover:bg-[#121824]/80",
        destructive:
          "bg-[#FF4655]/15 text-[#FF4655] border-[#FF4655]/30 hover:bg-[#FF4655]/25 active:scale-[0.98]",
        success:
          "bg-[#10E7B2]/15 text-[#10E7B2] border-[#10E7B2]/30 hover:bg-[#10E7B2]/25 active:scale-[0.98]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-sm font-black",
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

