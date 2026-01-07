"use client";

import { CheckCircle2Icon, KeyRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AdminActions_GetUser_Result,
  AdminActions_GetUser_Result_AccessToken,
  revokeTokenAction,
} from "@/src/actions/per-page/admin";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useState } from "react";
import { toast } from "sonner";

function formatDateTime(date: Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IL");
}

export default function UserTokensTab({
  user,
  canManageTokens,
}: {
  user: AdminActions_GetUser_Result;
  canManageTokens: boolean;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-2">
      {/* Tokens header & separator */}
      <div>
        {/* Header & separator */}
        <div className="mb-1 border-b border-muted-foreground/40">
          <span className="text-xs font-semibold text-muted-foreground">
            Tokens
          </span>
        </div>
        <AccessTokensSection
          tokens={user.accessTokens}
          router={router}
          canManageTokens={canManageTokens}
        />
      </div>

      {/* Settings section */}
      <div>
        {/* Header & separator */}
        <div className="mb-1 border-b border-muted-foreground/40">
          <span className="text-xs font-semibold text-muted-foreground">
            Settings
          </span>
        </div>
        <SettingsSection
          router={router}
          defaultTokenExpirySeconds={user.defaultTokenExpirySeconds}
          maxAccessTokensAtATime={user.maxTokensAtATime}
        />
      </div>
    </div>
  );
}

function AccessTokensSection({
  router,
  tokens,
  canManageTokens,
}: {
  router: AppRouterInstance;
  tokens: AdminActions_GetUser_Result_AccessToken[];
  canManageTokens: boolean;
}) {
  return (
    <div>
      <div>
        <p className="text-muted-foreground">
          {tokens.length} {tokens.length == 1 ? "token" : "tokens"}
        </p>
      </div>
      {/* Render each access token */}
      {tokens
        ?.sort((a, b) => {
          const aTime = a.lastUseTimestamp
            ? new Date(a.lastUseTimestamp).getTime()
            : 0;
          const bTime = b.lastUseTimestamp
            ? new Date(b.lastUseTimestamp).getTime()
            : 0;
          return bTime - aTime; // latest first
        })
        .map((token, idx) => {
          return (
            <div
              key={idx}
              className={`flex flex-col mt-2 p-2 border rounded-md transition-shadow duration-200 border-muted-foreground`}
            >
              <TokenRow
                tokenAlias={token.alias}
                router={router}
                canManageTokens={canManageTokens}
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
              </div>
            </div>
          );
        })}
    </div>
  );
}

function TokenRow({
  router,
  tokenAlias,
  canManageTokens,
}: {
  router: AppRouterInstance;
  tokenAlias: string;
  canManageTokens: boolean;
}) {
  const [revoking, setRevoking] = useState(false);

  const handleRevoke = async () => {
    setRevoking(true);

    const revokeTokenActionResult = await revokeTokenAction(tokenAlias);
    if (revokeTokenActionResult.success) {
      toast("Revoked token", {
        description: "Successfully revoked this token.",
        icon: <CheckCircle2Icon className="text-success-foreground w-5 h-5" />,
        duration: 3000,
      });
    }

    router.refresh();
    setRevoking(false);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <span className="text-muted-foreground font-medium">Token:</span>{" "}
        <span className="font-medium text-1xl text-muted-foreground">
          {tokenAlias}
        </span>
      </div>

      {canManageTokens ? (
        <button
          onClick={handleRevoke}
          disabled={revoking}
          className="text-sm font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded hover:bg-destructive/20 transition"
        >
          {revoking ? "Revoking..." : "Revoke"}
        </button>
      ) : null}
    </div>
  );
}

function SettingsSection({
  router,
  defaultTokenExpirySeconds,
  maxAccessTokensAtATime,
}: {
  router: AppRouterInstance;
  defaultTokenExpirySeconds: number;
  maxAccessTokensAtATime: number | null;
}) {
  return (
    <div>
      <div>
        <p className="font-medium text-1xl">Default token expiry</p>
        <p className="text-muted-foreground">
          {defaultTokenExpirySeconds} seconds
        </p>
      </div>

      <div>
        <p className="font-medium text-1xl">Max access tokens at a time</p>
        <p className="text-muted-foreground">{maxAccessTokensAtATime ?? "—"}</p>
      </div>
    </div>
  );
}
