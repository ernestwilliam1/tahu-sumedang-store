import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#1C1917] text-white hover:bg-[#292524] shadow-sm",
        amber: "bg-[#D97706] text-white hover:bg-[#B45309] shadow-[0_4px_14px_rgba(217,119,6,0.25)]",
        destructive: "bg-[#DC2626] text-white hover:bg-[#B91C1C]",
        outline: "border border-[#E5E2DC] bg-white hover:bg-[#F3F1ED] text-[#1C1917]",
        secondary: "bg-[#F3F1ED] text-[#1C1917] hover:bg-[#E5E2DC]",
        ghost: "hover:bg-[#F3F1ED] text-[#57534E] hover:text-[#1C1917]",
        link: "text-[#D97706] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = "Button"
export { Button, buttonVariants }
