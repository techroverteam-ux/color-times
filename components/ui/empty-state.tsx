import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary">
        <Icon className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h3 className="mt-5 font-heading text-xl">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
