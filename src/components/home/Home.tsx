"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/custom-shadcn/card";
import { ClientExpense, ClientUser } from "../../utils/client_types";
import {
  Landmark,
  Info,
  HandCoins,
  Pencil,
  Trash,
  CircleQuestionMark,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeWelcome({
  user,
  loading,
  errorString,
}: {
  user: ClientUser | null;
  loading: boolean;
  errorString: string;
}) {
  if (loading) {
    return (
      <div>
        <p className="font-semibold text-2xl mb-2">
          Welcome, {<Skeleton className="h-4 w-[200px]" />}
        </p>
        <p className="font-medium text-1xl text-muted-foreground">
          User ID: {<Skeleton className="h-4 w-[200px]" />}
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className="font-semibold text-2xl mb-2">Welcome, {user?.username}</p>
      <p className="font-medium text-1xl text-muted-foreground">
        User ID: {user?.id}
      </p>
    </div>
  );
}
