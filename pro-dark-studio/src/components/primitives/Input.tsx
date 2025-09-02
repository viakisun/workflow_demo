import { forwardRef } from "react";
import { clsx } from "clsx";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          "flex h-9 w-full rounded-lg border bg-panel px-3 py-1 text-sm shadow-sm transition-colors",
          "border-stroke placeholder:text-subtle",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-info",
          error && "border-danger ring-danger",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
