import * as React from "react"
import { cn } from "@/lib/utils"

const buttonVariants = {
  default: "bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors",
  secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-md transition-colors",
  danger: "bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors",
  ghost: "hover:bg-primary/10 hover:text-primary transition-colors",
  link: "underline-offset-4 hover:underline text-primary p-0 h-auto font-normal",
}

const buttonSizes = {
  default: "px-4 py-2",
  sm: "px-3 py-1.5 text-xs",
  lg: "px-6 py-3 text-base",
  icon: "h-9 w-9 p-0",
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants
  size?: keyof typeof buttonSizes
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading, asChild = false, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center",
          buttonVariants[variant],
          buttonSizes[size],
          loading && "opacity-50 cursor-not-allowed",
          className
        )}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <div className="spinner mr-2" />
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }