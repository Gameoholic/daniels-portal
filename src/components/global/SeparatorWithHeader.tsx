import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SeparatorWithHeader({
  showBorder = true,
  header,
  Icon,
}: {
  showBorder?: boolean;
  header?: string;
  Icon?: LucideIcon;
}) {
  return (
    <div className={cn(showBorder && "border-b border-muted-foreground/40")}>
      <span className="flex items-center text-xs font-semibold text-muted-foreground gap-1">
        {Icon && <Icon className="w-4 h-4" />}
        {header}
      </span>
    </div>
  );
}
