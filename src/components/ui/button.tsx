"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white shadow-btn hover:bg-accent-light active:scale-[0.97] disabled:opacity-50",
  secondary:
    "bg-primary text-white shadow-btn hover:bg-primary-light active:scale-[0.97] disabled:opacity-50",
  outline:
    "border-[1.5px] border-primary text-primary bg-transparent hover:bg-primary/5 active:scale-[0.97] disabled:opacity-50",
  ghost:
    "text-neutral-600 bg-transparent hover:bg-neutral-100 active:scale-[0.97] disabled:opacity-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  default: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "default",
      loading = false,
      asChild = false,
      className = "",
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    return (
      <Comp
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2
          rounded-btn font-semibold
          transition-all duration-100 ease-out
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${isDisabled ? "pointer-events-none" : "cursor-pointer"}
          ${className}
        `}
        disabled={isDisabled}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, type ButtonProps, type ButtonVariant };
