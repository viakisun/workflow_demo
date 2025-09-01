import { forwardRef } from "react";
import { clsx } from "clsx";

type TooltipProps = React.HTMLAttributes<HTMLDivElement> & {
  label: string;
  side?: "top" | "bottom" | "left" | "right";
};

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, label, children, side = "top", ...props }, ref) => {
    return (
      <div ref={ref} className="relative group" {...props}>
        {children}
        <div
          className={clsx(
            "absolute px-2 py-1 bg-panel-2 text-text text-xs rounded-md shadow-lg",
            "opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap",
            {
              "bottom-full left-1/2 -translate-x-1/2 mb-2": side === "top",
              "top-full left-1/2 -translate-x-1/2 mt-2": side === "bottom",
              "right-full top-1/2 -translate-y-1/2 mr-2": side === "left",
              "left-full top-1/2 -translate-y-1/2 ml-2": side === "right",
            },
            className
          )}
        >
          {label}
        </div>
      </div>
    );
  }
);

Tooltip.displayName = "Tooltip";

export { Tooltip };
