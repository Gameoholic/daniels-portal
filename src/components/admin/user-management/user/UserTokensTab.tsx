import { KeyRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminActions_GetUser_Result } from "@/src/actions/per-page/admin";

function formatDateTime(date: Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IL");
}

export default function UserTokensTab({
  user,
  canManageUsers,
  onUnimplemented,
}: {
  user: AdminActions_GetUser_Result;
  canManageUsers: boolean;
  onUnimplemented: (reason: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Access Tokens</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user.accessTokens.length === 0 ? (
          <p className="text-muted-foreground text-sm">No access tokens</p>
        ) : (
          user.accessTokens.map((token) => (
            <div
              key={token.aliasToken}
              className="border rounded-lg p-3 text-sm space-y-2"
            >
              <p>
                <strong>Alias:</strong> {token.aliasToken}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {formatDateTime(token.creationTimestamp)}
              </p>
              <p>
                <strong>Expires:</strong>{" "}
                {formatDateTime(token.expirationTimestamp)}
              </p>
              <p>
                <strong>Last used:</strong>{" "}
                {formatDateTime(token.lastUseTimestamp)}
              </p>

              {canManageUsers && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    onUnimplemented(`Revoke token ${token.aliasToken}`)
                  }
                >
                  <KeyRound className="h-4 w-4 mr-2" />
                  Revoke
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
