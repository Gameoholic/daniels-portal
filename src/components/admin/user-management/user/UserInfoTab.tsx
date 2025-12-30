import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdminActions_GetUser_Result } from "@/src/actions/per-page/admin";

function formatDateTime(date: Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IL");
}

export default function UserInfoTab({
  user,
  isEditing,
}: {
  user: AdminActions_GetUser_Result;
  isEditing: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Info & Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <p className="font-medium">Email</p>
          {isEditing ? (
            <Input defaultValue={user.email} />
          ) : (
            <p className="text-muted-foreground">{user.email}</p>
          )}
        </div>

        <div>
          <p className="font-medium">User ID</p>
          <p className="text-muted-foreground">{user.id}</p>
        </div>

        <div>
          <p className="font-medium">Created</p>
          <p className="text-muted-foreground">
            {formatDateTime(user.creationTimestamp)}
          </p>
        </div>

        <div>
          <p className="font-medium">Last login</p>
          <p className="text-muted-foreground">
            {formatDateTime(user.lastLoginTimestamp)}
          </p>
        </div>

        <div>
          <p className="font-medium">Default token expiry (seconds)</p>
          {isEditing ? (
            <Input
              type="number"
              defaultValue={user.defaultTokenExpirySeconds}
            />
          ) : (
            <p className="text-muted-foreground">
              {user.defaultTokenExpirySeconds}
            </p>
          )}
        </div>

        <div>
          <p className="font-medium">Max tokens at a time</p>
          {isEditing ? (
            <Input
              type="number"
              defaultValue={user.maxTokensAtATime ?? ""}
              placeholder="Unlimited"
            />
          ) : (
            <p className="text-muted-foreground">
              {user.maxTokensAtATime ?? "Unlimited"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
