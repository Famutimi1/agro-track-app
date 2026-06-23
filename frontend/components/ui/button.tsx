import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "gold" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-green text-white hover:bg-brand-green-light border-transparent",
  secondary:
    "bg-transparent border border-[var(--border)] text-[var(--text)] hover:bg-[var(--input-bg)]",
  ghost: "bg-transparent border-transparent text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--input-bg)]",
  gold: "bg-brand-gold text-brand-green font-bold border-transparent hover:brightness-110",
  danger: "bg-red-600 text-white border-transparent hover:bg-red-700",
  outline: "bg-transparent border border-[var(--border)] text-[var(--text)] hover:bg-[var(--input-bg)]",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-[10px]",
  lg: "px-6 py-3 text-sm rounded-xl",
  icon: "h-10 w-10 p-0 rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
