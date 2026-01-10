import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  displayDateInEnglishFormat,
  displayDateInFullFormat,
} from "@/src/util/date";
import { cn } from "@/lib/utils";

export function Date({ date, className }: { date: Date; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn(className)}>
          {displayDateInEnglishFormat(date)}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <span>{displayDateInFullFormat(date)}</span>
      </TooltipContent>
    </Tooltip>
  );
}
