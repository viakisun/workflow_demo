import { forwardRef } from "react";
import { clsx } from "clsx";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "bg-panel-2 rounded-xl border border-stroke",
          "transition-shadow duration-300 hover:shadow-[0_0_15px_2px_rgba(45,55,72,0.5)]",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export { Card };
