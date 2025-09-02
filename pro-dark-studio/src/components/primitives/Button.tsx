import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/40 disabled:opacity-40 disabled:pointer-events-none active:translate-y-px",
  {
    variants: {
      variant: {
        primary: "bg-info text-white shadow-sm hover:brightness-110",
        subtle: "bg-panel-2 border border-stroke text-muted hover:text-text hover:border-info/50",
        ghost: "text-muted hover:bg-panel-2 hover:text-text",
        destructive: "bg-danger text-white hover:brightness-110",
      },
      size: {
        default: "h-9 px-4", // 36px
        sm: "h-8 px-3 rounded-md", // 32px
        lg: "h-10 px-8 rounded-md", // 40px
        icon: "h-9 w-9", // 36px
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={clsx(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
