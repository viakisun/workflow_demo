import { clsx } from "clsx";

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  color?: "blue" | "yellow" | "green" | "gray";
};

export function Badge({ className, color = "gray", ...props }: BadgeProps) {
  return (
    <div
      className={clsx(
        "px-2 py-0.5 text-xs font-medium rounded-full inline-block",
        {
          "bg-node-trigger/20 text-node-trigger": color === "blue",
          "bg-node-condition/20 text-node-condition": color === "yellow",
          "bg-node-action/20 text-node-action": color === "green",
          "bg-node-end/20 text-node-end": color === "gray",
        },
        className
      )}
      {...props}
    />
  );
}
