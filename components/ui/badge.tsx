import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-normal transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "border-rose-500/20 bg-rose-500/10 text-rose-400",
        win:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-bold",
        loss:
          "border-rose-500/20 bg-rose-500/10 text-rose-400 font-bold",
        draw:
          "border-amber-500/20 bg-amber-500/10 text-amber-400 font-bold",
        mvp:
          "border-amber-500/25 bg-amber-500/10 text-amber-300 font-bold",
        secondary:
          "border-[#1c2433] bg-[#161d28] text-[#f1f5f9]",
        outline:
          "border-[#1c2433] text-[#94a3b8] bg-transparent",
        attack:
          "border-rose-500/20 bg-rose-500/10 text-rose-300 font-medium",
        defense:
          "border-sky-500/20 bg-sky-500/10 text-sky-300 font-medium",
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


