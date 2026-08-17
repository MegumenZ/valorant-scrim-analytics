import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "border-rose-500/30 bg-rose-500/15 text-rose-400",
        win:
          "border-emerald-500/30 bg-emerald-500/15 text-emerald-400 font-bold",
        loss:
          "border-rose-500/30 bg-rose-500/15 text-rose-400 font-bold",
        draw:
          "border-amber-500/30 bg-amber-500/15 text-amber-400 font-bold",
        mvp:
          "border-sky-500/30 bg-sky-500/15 text-sky-400 font-bold",
        secondary:
          "border-[#242e40] bg-[#1c2432] text-[#f1f5f9]",
        outline:
          "border-[#242e40] text-[#94a3b8] bg-transparent",
        attack:
          "border-rose-500/25 bg-rose-500/10 text-rose-400",
        defense:
          "border-sky-500/25 bg-sky-500/10 text-sky-400",
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
