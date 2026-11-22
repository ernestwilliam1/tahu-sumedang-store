import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#D97706]/20",
  {
    variants: {
      variant: {
        default: "border-[#FDE68A] bg-[#FEF3C7] text-[#92400E]",
        secondary: "border-[#E5E2DC] bg-[#F3F1ED] text-[#57534E]",
        success: "border-[#A7F3D0] bg-[#D1FAE5] text-[#065F46]",
        destructive: "border-red-200 bg-[#FEE2E2] text-[#991B1B]",
        outline: "border-[#E5E2DC] text-[#1C1917] bg-white",
      },
    },
    defaultVariants: { variant: "default" },
  }
)
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
export { Badge, badgeVariants }
