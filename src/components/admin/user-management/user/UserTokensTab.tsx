"use client";

import { CheckCircle2Icon, KeyRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminActions_GetUser_Result } from "@/src/actions/per-page/admin";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useState } from "react";
import { revokeTokenAction } from "@/src/actions/per-page/user-settings";
import { toast } from "sonner";

function formatDateTime(date: Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IL");
}

export default function UserTokensTab({
  user,
  onUnimplemented,
}: {
  user: AdminActions_GetUser_Result;
  onUnimplemented: (reason: string) => void;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between"></div>

      <p className="font-medium text-1xl text-muted-foreground">
        Access tokens: {user.accessTokens.length}
      </p>
      {/* Render each access token */}
      {user.accessTokens
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
              <TokenRow token={token.aliasToken} router={router} />
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
  token,
  router,
}: {
  token: string;
  router: AppRouterInstance;
}) {
  const [revoking, setRevoking] = useState(false);

  const handleRevoke = async () => {
    setRevoking(true);

    // todo: this will not work.
    const revokeTokenActionResult = await revokeTokenAction(token);
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
    <div className="relative flex items-center gap-2">
      {/* Revoke button at top-right */}
      <span className="text-muted-foreground font-medium">Token:</span>{" "}
      <button
        onClick={handleRevoke}
        disabled={revoking}
        className="absolute top-2 right-2 text-sm font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded hover:bg-destructive/20 transition"
      >
        {revoking ? "Revoking..." : "Revoke"}
      </button>
      <span className="font-medium text-1xl text-muted-foreground">
        {token}
      </span>
    </div>
  );
}
