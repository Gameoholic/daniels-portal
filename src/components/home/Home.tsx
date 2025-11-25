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
} from "@/src/components/custom/card";
import { ClientExpense, ClientUser } from "../../utils/client_types";
import { Landmark, Info, HandCoins, Pencil, Trash, CircleQuestionMark } from "lucide-react";
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
    if (loading)
    {
        return (<div>
      <p className="font-semibold text-2xl mb-2">Welcome, {<Skeleton className="h-4 w-[200px]" />}</p>
      <p className="font-medium text-1xl text-muted-foreground">
        User ID: {<Skeleton className="h-4 w-[200px]" />}
      </p>
      <p className="font-medium text-1xl text-muted-foreground">
        Email: {<Skeleton className="h-4 w-[200px]" />}
      </p>
      <p className="font-medium text-1xl text-muted-foreground">
        Last log-in: {<Skeleton className="h-4 w-[200px]" />}
      </p>
      <div className="flex gap-1 items-center">
        <p className="font-medium text-1xl text-muted-foreground">
          Access tokens: {<Skeleton className="h-4 w-[200px]" />}
        </p>
        <AccessTokensTooltip />
      </div>
    </div>
  );
    }
  return (
    <div>
      <p className="font-semibold text-2xl mb-2">Welcome, {user?.username}</p>
      <p className="font-medium text-1xl text-muted-foreground">
        User ID: {user?.id}
      </p>
      <p className="font-medium text-1xl text-muted-foreground">
        Email: {user?.email}
      </p>
      <div className="flex gap-1 items-center">
        <p className="font-medium text-1xl text-muted-foreground">
          Last successful log-in: {user?.lastLoginTimestamp?.toDateString()}
        </p>
        <LastLoginTooltip />
      </div>
        <div className="flex gap-1 items-center">
        <p className="font-medium text-1xl text-muted-foreground">
          Last website access: {}
        </p>
        <LastLoginTooltip />
      </div>
      <div className="flex gap-1 items-center">
        <p className="font-medium text-1xl text-muted-foreground">
          Since last successful login, there have been {} unsuccessful login attempts.
        </p>
        <LastLoginTooltip />
      </div>
      <div className="flex gap-1 items-center">
        <p className="font-medium text-1xl text-muted-foreground">
          Access tokens: $NUMBER
        </p>
        <AccessTokensTooltip />
      </div>
    </div>
  );
}

function AccessTokensTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <CircleQuestionMark className="h-5 w-5 text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-h-50 max-w-100 m-1 space-y-1">
          <p className="text-wrap">
            Access tokens are data stored on your device via cookies that allow
            connection to your account without the need to enter a password each
            time.
          </p>
          <p className="text-wrap">
            If there is currently more than one access token, you may have
            previously logged in through other devices.
          </p>
          <p className="text-wrap">
            You can view and revoke access tokens in the account settings, or
            revoke the access token you're currently connected with immediately
            by logging out.
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}


function LastLoginTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <CircleQuestionMark className="h-5 w-5 text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-h-50 max-w-100 m-1 space-y-1">
          <p className="text-wrap">
            The last successful log in made on your account using your password.
            This does not include devices accessing your account via already existing
            access tokens.
            To:
            - See last website access using your account
            - Revoke access tokens and manage when they expire
            - Manage account security
            - Last failed log in
            Go to User Settings.
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
