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
import {
  ClientAccessToken,
  ClientExpense,
  ClientUser,
} from "../../utils/client_types";
import {
  Landmark,
  Info,
  HandCoins,
  Pencil,
  Trash,
  CircleQuestionMark,
  EyeOff,
  Eye,
  CheckCircle2Icon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ReactNode, useState } from "react";
import SensitiveComponent from "../custom/sensitive-component";
import {
  invalidateSelfAccessToken,
  logUserOut,
} from "@/src/actions/user-actions";
import { toast } from "sonner";
import { Router, useRouter } from "next/router";

export default function AdvancedSettings({
  user,
  loading,
  errorString,
}: {
  user: ClientUser | null;
  loading: boolean;
  errorString: string;
}) {
  if (loading) {
    return <div>todo skeletons here</div>;
  }
  return (
    <div>
      <p className="font-semibold text-2xl mb-2">Advanced Security Settings</p>
      <p className="font-semibold text-1xl">Account Details</p>
      <p>Default token expiry: {user?.defaultTokenExpirySeconds}</p>
      <p>Max access tokens at a time: {user?.maxTokensAtATime}</p>
    </div>
  );
}
