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

export default function Security({
  user,
  accessTokens,
  currentAccessToken,
  loading,
  errorString,
}: {
  user: ClientUser | null;
  accessTokens: ClientAccessToken[] | null;
  currentAccessToken: string | null;
  loading: boolean;
  errorString: string;
}) {
  if (loading) {
    return <div>todo skeletons here</div>;
  }
  return (
    <div>
      <p className="font-semibold text-2xl mb-2">Account Security</p>
      <p className="font-semibold text-1xl">Account Details</p>
      <p className="font-medium text-1xl text-muted-foreground">
        Username: {user?.username}
      </p>
      <p className="font-medium text-1xl text-muted-foreground">
        User ID: {user?.id}
      </p>

      <div className="relative flex items-center gap-2">
        <span className="text-muted-foreground font-medium">Email:</span>{" "}
        <SensitiveComponent secureLength={user?.email.length}>
          <span className="font-medium text-1xl text-muted-foreground">
            {user?.email}
          </span>
        </SensitiveComponent>
      </div>

      <p className="font-medium text-1xl text-muted-foreground">
        Account Creation Date:{" "}
        {new Date(user?.creationTimestamp ?? "").toLocaleString("en-il")}
      </p>
      <Separator className="my-4" />
      <div className="flex gap-2 items-center">
        <p className="font-semibold text-1xl">Access Tokens</p>
        <AccessTokensTooltip />
      </div>
      <div className="flex gap-2 items-center">
        <p className="font-medium text-1xl text-muted-foreground">
          Last successful log-in:{" "}
          {new Date(user?.lastLoginTimestamp ?? "").toLocaleString("en-il")}
        </p>
        <LastLoginTooltip />
      </div>
      <p className="font-medium text-1xl text-muted-foreground">
        Access tokens: {accessTokens?.length}
      </p>
      {/* Render each access token */}
      {accessTokens?.map((token, idx) => {
        const isCurrentlyUsedToken = currentAccessToken == token.token;
        return (
          <div
            key={idx}
            className={`flex flex-col mt-2 p-2 border rounded-md transition-shadow duration-200 ${
              isCurrentlyUsedToken
                ? "border-success-foreground"
                : "border-muted-foreground"
            }`}
          >
            <TokenRow
              token={token.token}
              isCurrentlyUsedToken={isCurrentlyUsedToken}
            />
            <p className="font-medium text-1xl text-muted-foreground mt-3">
              Creation:{" "}
              {new Date(token.creationTimestamp).toLocaleString("en-il")}
            </p>
            <p className="font-medium text-1xl text-muted-foreground">
              Expiration:{" "}
              {new Date(token.expirationTimestamp).toLocaleString("en-il")}
            </p>
            <div className="flex gap-2 items-center">
              <p className="font-medium text-1xl text-muted-foreground">
                Last use:{" "}
                {token.lastUseTimestamp
                  ? new Date(token.lastUseTimestamp).toLocaleString("en-il")
                  : "Never"}
              </p>
              <AccessTokenLastUseTooltip />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TokenRow({
  token,
  isCurrentlyUsedToken,
}: {
  token: string;
  isCurrentlyUsedToken: boolean;
}) {
  const [revoking, setRevoking] = useState(false);

  const handleRevoke = async () => {
    setRevoking(true);
    try {
      if (isCurrentlyUsedToken) {
        await logUserOut();
      } else {
        await invalidateSelfAccessToken(token);
      }
      toast("Revoked token", {
        description: "Successfully revoked this token.",
        icon: <CheckCircle2Icon className="text-success-foreground w-5 h-5" />,
        duration: 3000,
      });
    } catch (e) {
      alert("Failed to revoke token.");
    }
    setRevoking(false);
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Revoke button at top-right */}
      <span className="text-muted-foreground font-medium">Token:</span>{" "}
      <button
        onClick={handleRevoke}
        disabled={revoking}
        className="absolute top-2 right-2 text-sm font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded hover:bg-destructive/20 transition"
      >
        {isCurrentlyUsedToken
          ? revoking
            ? "Logging out..."
            : "Log out"
          : revoking
          ? "Revoking..."
          : "Revoke"}
      </button>
      {isCurrentlyUsedToken && (
        <span className="text-sm font-semibold text-success-foreground bg-success px-2 py-0.5 rounded-full">
          Current
        </span>
      )}
      <SensitiveComponent blurAmount={8} secureLength={token.length}>
        <span className="font-medium text-1xl text-muted-foreground">
          {token}
        </span>
      </SensitiveComponent>
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
            Access tokens are data stored on your device via cookies that allows
            connection to your account without the need to enter a password each
            time. They are created automatically upon log-in.
          </p>
          <p className="text-wrap text-error-foreground">
            Caution: Never reveal your access token to anybody else. Anybody can
            put it in their device and use it to perform operations as you and
            fetch data without authentication. If you believe a token has been
            compromised, revoke all tokens immediately, and change your password
            just to be safe.
          </p>
          <p className="text-wrap">
            Logging out automatically revokes your current access token, but not
            all others. If there is currently more than one access token, you
            may have previously logged in through other devices.
          </p>
          <p className="text-wrap">
            Access tokens automatically expire after a set amount of time, which
            can be configured in the Advanced Settings.
          </p>
          <p className="text-wrap">
            You can view and manually revoke access tokens here.
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function AccessTokenLastUseTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <CircleQuestionMark className="h-5 w-5 text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-h-50 max-w-100 m-1 space-y-1">
          <p className="text-wrap">
            The last time this token was used for any operation that requires
            authentication (meaning opening a page, adding/deleting data, etc.)
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
            This does not include devices accessing your account via
            pre-existing access tokens.
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
