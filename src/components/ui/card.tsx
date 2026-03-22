import { forwardRef, type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "default" | "none";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ padding = "default", className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-card bg-white shadow-card
          ${padding === "default" ? "p-6" : ""}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = "Card";

export { Card, type CardProps };
