import * as React from "react";

// Custom wrapper for the shadcn component
import { cn } from "@/lib/utils";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription as OriginalShadcnCardDescription,
  CardFooter,
  CardHeader,
  CardTitle as OriginalShadcnCardTitle,
} from "@/components/ui/card";

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <OriginalShadcnCardTitle className={cn("text-lg", className)} {...props} />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <OriginalShadcnCardDescription
      className={cn("text-card-foreground text-lg", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  CardFooter,
  CardDescription,
};
