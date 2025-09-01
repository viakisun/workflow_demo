import { clsx } from "clsx";

type FormRowProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

export function FormRow({ label, children, className }: FormRowProps) {
  return (
    <div className={clsx("flex items-center gap-4", className)}>
      <label className="text-sm text-muted w-20 shrink-0">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  );
}
