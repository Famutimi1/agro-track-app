import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-colors resize-none",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
