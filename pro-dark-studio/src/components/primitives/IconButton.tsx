import { forwardRef } from "react";
import { Button, ButtonProps } from "./Button";
import type { LucideProps } from "lucide-react";

type IconButtonProps = ButtonProps & {
  icon: React.ComponentType<LucideProps>;
  label: string;
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, label, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        aria-label={label}
        {...props}
      >
        <Icon className="size-5" />
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";

export { IconButton };
