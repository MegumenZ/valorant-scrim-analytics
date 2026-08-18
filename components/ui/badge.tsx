import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center uppercase font-display px-2 py-0.5 text-[11px] font-bold tracking-wider transition-colors select-none rounded-[3px] border",
  {
    variants: {
      variant: {
        default:
          "border-[#FF4655]/40 bg-[#FF4655]/15 text-[#FF4655]",
        win:
          "border-[#10E7B2]/40 bg-[#10E7B2]/15 text-[#10E7B2] shadow-sm shadow-[#10E7B2]/20",
        loss:
          "border-[#FF4655]/40 bg-[#FF4655]/15 text-[#FF4655] shadow-sm shadow-[#FF4655]/20",
        draw:
          "border-[#FFD166]/40 bg-[#FFD166]/15 text-[#FFD166]",
        mvp:
          "border-[#FFD166]/50 bg-[#FFD166]/15 text-[#FFD166] shadow-sm shadow-[#FFD166]/20",
        secondary:
          "border-[#1f2c42] bg-[#141d2b] text-[#ece8e1]",
        outline:
          "border-[#1f2c42] text-[#8b9bb4] bg-transparent",
        attack:
          "border-[#FF4655]/30 bg-[#FF4655]/10 text-[#FF4655]",
        defense:
          "border-[#00F5D4]/30 bg-[#00F5D4]/10 text-[#00F5D4]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

