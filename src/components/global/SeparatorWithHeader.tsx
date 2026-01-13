import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SeparatorWithHeader({
  showBorder = true,
  header,
  Icon,
  className,
}: {
  showBorder?: boolean;
  header?: string;
  Icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        showBorder && "border-b border-muted-foreground/40",
        className
      )}
    >
      <span className="flex items-center text-xs font-semibold text-muted-foreground gap-1">
        {Icon && <Icon className="w-4 h-4" />}
        {header}
      </span>
    </div>
  );
}
