import { forwardRef } from "react";
import { clsx } from "clsx";
import type { LucideProps } from "lucide-react";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: React.ComponentType<LucideProps>;
  label: string;
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, icon: Icon, label, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        className={clsx(
          "size-9 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-panel-2 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:ring-blue-500",
          className
        )}
        {...props}
      >
        <Icon className="size-5" />
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export { IconButton };
