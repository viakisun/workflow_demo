import { forwardRef } from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={clsx(
            "flex h-9 w-full items-center justify-between rounded-lg border border-stroke bg-panel px-3 py-1 text-sm shadow-sm",
            "ring-offset-background placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-1 focus:ring-info",
            error && "border-danger ring-danger",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "appearance-none", // Remove default arrow
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
